import { useEffect, useState } from "react"
import styled from "styled-components"
import moment from "moment"
import { Button, Row, Typography, Space, List, Modal, Spin, Card, Col } from "antd"
import * as anchor from "@project-serum/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { take, pipe, isEmpty, not, concat, drop, length, view, lensPath, gt } from "ramda"
import { LoadingOutlined } from '@ant-design/icons';
import { useWallet } from "@solana/wallet-adapter-react"
import pluralize from 'pluralize'
import useInfiniteScroll from 'react-infinite-scroll-hook'

import {
  CandyMachine,
  awaitTransactionSignatureConfirmation,
  getCandyMachineState,
  mintOneToken,
  ConfigLine,
  getNFTsFromConfigLines,
} from "@/modules/candy-machine";
import { WalletMultiButton, WalletModalProvider } from "@solana/wallet-adapter-ant-design";

const { Meta } = Card
const { Title, Paragraph, Text } = Typography

export interface DropProps {
  candyMachineId: anchor.web3.PublicKey;
  config: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  treasury: anchor.web3.PublicKey;
  txTimeout: number;
  theme: any;
}

const Drop = (props: DropProps) => {
  const [balance, setBalance] = useState<number>();
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [loadingCandyMachine, setLoadingCandyMachine] = useState(false)
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [startDate, setStartDate] = useState<moment.Moment>(moment.unix(props.startDate))
  const [now, setNow] = useState<moment.Moment>(moment())
  const [isMinting, setIsMinting] = useState(false);
  const [itemsRemaining, setItemsRemaining] = useState<number>()
  const [price, setPrice] = useState<number>()
  const [configLines, setConfigLines] = useState<ConfigLine[]>([])
  const [itemsAvailable, setItemsAvailable] = useState<number>()
  const [nfts, setNFTs] = useState<any[]>([])
  const [hasMoreConfigLines, setHasMoreConfigLines] = useState(true)
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

  const duration = moment.duration(startDate.diff(now));

  const wallet = useWallet();
  const [candyMachine, setCandyMachine] = useState<CandyMachine>();

  const onMint = async () => {
    try {
      setIsMinting(true);
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        const mintTxId = await mintOneToken(
          candyMachine,
          props.config,
          wallet.publicKey,
          props.treasury
        );

        const status = await awaitTransactionSignatureConfirmation(
          mintTxId,
          props.txTimeout,
          props.connection,
          "singleGossip",
          false
        );

        if (!status?.err) {
          setItemsRemaining(itemsRemaining as number - 1)
          setAlertState({
            open: true,
            message: "Congratulations! Mint succeeded!",
            severity: "success",
          });
        } else {
          setAlertState({
            open: true,
            message: "Mint failed! Please try again!",
            severity: "error",
          });
        }
      }
    } catch (error: any) {
      // TODO: blech:
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          setIsSoldOut(true);
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      if (wallet?.publicKey) {
        const balance = await props.connection.getBalance(wallet?.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
      setIsMinting(false);
    }
  };

  const loadMoreConfigLines = async () => {
    setLoadingNFTs(true)
    const next = await getNFTsFromConfigLines(take(4 * 2, configLines))
    const remaining = drop(length(next), configLines)

    setLoadingNFTs(false)
    setConfigLines(remaining)
    setNFTs(concat(nfts, next))
    setHasMoreConfigLines(pipe(isEmpty, not)(remaining))
  }

  const [sentryRef] = useInfiniteScroll({
    loading: loadingNFTs,
    hasNextPage: hasMoreConfigLines,
    onLoadMore: loadMoreConfigLines,
  });

  useEffect(() => {
    (async () => {
      if (wallet?.publicKey) {
        const balance = await props.connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    })();
  }, [wallet, props.connection]);

  useEffect(() => {
    (async () => {
      if (
        !wallet ||
        !wallet.publicKey ||
        !wallet.signAllTransactions ||
        !wallet.signTransaction
      ) {
        return;
      }

      setLoadingCandyMachine(true)

      const anchorWallet = {
        publicKey: wallet.publicKey,
        signAllTransactions: wallet.signAllTransactions,
        signTransaction: wallet.signTransaction,
      } as anchor.Wallet;

      const { candyMachine, goLiveDate, itemsRemaining, price, configLines, itemsAvailable } =
        await getCandyMachineState(
          anchorWallet,
          props.candyMachineId,
          props.config,
          props.connection,
        );

      const nfts = await getNFTsFromConfigLines(take(4 * 3, configLines))

      setIsSoldOut(itemsRemaining === 0);
      setItemsRemaining(itemsRemaining)
      setItemsAvailable(itemsAvailable)
      setStartDate(moment(goLiveDate))
      setConfigLines(drop(length(nfts), configLines))
      setNFTs(nfts)
      setCandyMachine(candyMachine)
      setPrice(price / LAMPORTS_PER_SOL)
      setLoadingCandyMachine(false)
    })();
  }, [wallet, props.candyMachineId, props.connection]);

  useEffect(() => {
    const tickDuration = setInterval(() => { setNow(moment()) }, 1000)

    return () => {
      clearInterval(tickDuration)
    }
  }, [startDate])

  return (
    <Row justify="center">
      <Space align="center" direction="vertical">
        <Title>Simple Shapes</Title>
        <Paragraph>Simple Shapes is true to its name. You get a color, you get a shape, you go home.</Paragraph>
        {isSoldOut ? (
          <>
            <Title level={2}>Sold out!</Title>
            <Paragraph>All NFTs are sold out.</Paragraph>
          </>
        ) : now.isAfter(startDate) ? (
          <Space direction="vertical" size="small" align="center">
            <Title level={3}>Sale is live!</Title>
            {loadingCandyMachine ? (
              <Spin size="large" indicator={<LoadingOutlined />} />
            ) : (
              <>
                <Button onClick={onMint} type="primary" size="large" loading={isMinting}>
                  Buy Now - {price} SOL
                </Button>
                <Text>{itemsRemaining}/{itemsAvailable} remaining</Text>
              </>
            )}
          </Space>
        ) : (
          <Card>
            <Space direction="horizontal" size="middle">
              {gt(duration.years(), 0) && (
                <Space direction="vertical" align="center">
                  <Title level={3}>{duration.years()}</Title>
                  <Text>{pluralize('years')}</Text>
                </Space>
              )}
              {gt(duration.months(), 0) && (
                <Space direction="vertical" align="center">
                  <Title level={3}>{duration.months()}</Title>
                  <Text>{pluralize('month')}</Text>
                </Space>
              )}
              {gt(duration.days(), 0) && (
                <Space direction="vertical" align="center">
                  <Title level={3}>{duration.days()}</Title>
                  <Text>{pluralize('day')}</Text>
                </Space>
              )}
              <Space direction="vertical" align="center">
                <Title level={3}>{duration.hours()}</Title>
                <Text>{pluralize('hour')}</Text>
              </Space>
              <Space direction="vertical" align="center">
                <Title level={3}>{duration.minutes()}</Title>
                <Text>{pluralize('minute')}</Text>
              </Space>
              <Space direction="vertical" align="center">
                <Title level={3}>{duration.seconds()}</Title>
                <Text>{pluralize('second')}</Text>
              </Space>
            </Space>
          </Card>
        )}
        {not(wallet?.connected) && (
          <WalletModalProvider>
            <WalletMultiButton size="large">Connect Wallet</WalletMultiButton>
          </WalletModalProvider>
        )}
        <Row justify="center">
          <Col xs={24} sm={22} md={20}>
            {pipe(isEmpty, not)(nfts) && (
              <>
                <List
                  grid={{ xs: 1, sm: 3, md: 5, lg: 5, xl: 5, xxl: 5, gutter: 16 }}
                  dataSource={nfts}
                  renderItem={(nft: any, index: number) => (
                    <List.Item key={index}>
                      {/*@ts-ignore*/}
                      <Card
                        cover={<img alt={nft.name} src={nft.image} />}
                      >
                        <Meta title={nft.name} />
                      </Card>
                    </List.Item>
                  )}
                />
                <div ref={sentryRef} />
              </>
            )}
          </Col>
        </Row>
        <Modal visible={isMinting || alertState.severity === "error"} mask closable={alertState.severity === "error"} footer={null}>
          {alertState.severity === "error" ? (
            <Row justify="center">
              <Space direction="vertical" align="center">
                <Title level={1}>Nuts, something went wrong</Title>
                <Paragraph>{alertState.message}</Paragraph>
                <Button onClick={onMint} type="primary" size="large" loading={isMinting}>
                  Try Again - {price} SOL
                </Button>
                <Text>{itemsRemaining} remaining</Text>
              </Space>
            </Row>
          ) : (
            <Row justify="center">
              <Space direction="vertical" align="center">
                <Title level={1}>Minting your Simple Shape</Title>
                <Paragraph>Hold tight, a bunch of people are trying to do this right now. It could take a minute or two.</Paragraph>
                <Spin size="large" indicator={<LoadingOutlined />} />
              </Space>
            </Row>
          )}
        </Modal>
      </Space>
    </Row>
  );
};

interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error" | undefined;
}

export default Drop;

