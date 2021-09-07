import { useEffect, useState } from "react"
import styled from "styled-components"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { Alert, Button, Col, Row, Typography, Space, Modal, Spin } from "antd"
import * as anchor from "@project-serum/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { LoadingOutlined } from '@ant-design/icons';
import { useWallet } from "@solana/wallet-adapter-react";
import {
  CandyMachine,
  awaitTransactionSignatureConfirmation,
  getCandyMachineState,
  mintOneToken,
} from "@/modules/candy-machine";
import { WalletMultiButton, WalletModalProvider } from "@solana/wallet-adapter-ant-design";

dayjs.extend(relativeTime)

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
  const [isActive, setIsActive] = useState(false); // true when countdown completes
  const [isSoldOut, setIsSoldOut] = useState(false); // true when items remaining is zero
  const [startDate, setStartDate] = useState<dayjs.Dayjs>(dayjs(props.startDate))
  const [now, setNow] = useState<dayjs.Dayjs>(dayjs())
  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT
  const [itemsRemaining, setItemsRemaining] = useState<number>()
  const [price, setPrice] = useState<number>()

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });

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

      const anchorWallet = {
        publicKey: wallet.publicKey,
        signAllTransactions: wallet.signAllTransactions,
        signTransaction: wallet.signTransaction,
      } as anchor.Wallet;

      const { candyMachine, goLiveDate, itemsRemaining, price } =
        await getCandyMachineState(
          anchorWallet,
          props.candyMachineId,
          props.config,
          props.connection,
        );

      setIsSoldOut(itemsRemaining === 0);
      setItemsRemaining(itemsRemaining)
      setStartDate(dayjs(goLiveDate))
      setCandyMachine(candyMachine)
      setPrice(price / LAMPORTS_PER_SOL)
    })();
  }, [wallet, props.candyMachineId, props.connection]);


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
            {wallet.connected ? (
              <>
                <Button onClick={onMint} type="primary" size="large" loading={isMinting}>
                  Buy Now - {price} SOL
                </Button>
                <Text>{itemsRemaining} remaining</Text>
              </>
            ) : (
              <WalletModalProvider>
                <WalletMultiButton size="large">Connect Wallet</WalletMultiButton>
              </WalletModalProvider>
            )}
          </Space>
        ) : (
          startDate.toNow()
        )}
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

