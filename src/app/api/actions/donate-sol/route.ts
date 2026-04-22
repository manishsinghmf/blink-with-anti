import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  BLOCKCHAIN_IDS,
} from "@solana/actions";
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionMessage,
  VersionedMessage,
  VersionedTransaction,
} from "@solana/web3.js";

// CAIP-2 format for Solana Devnet
const blockchain = BLOCKCHAIN_IDS.devnet;

// Create a connection to the Solana devnet
const connection = new Connection("https://api.devnet.solana.com");

// Set the donation wallet address (Dummy valid key for testing)
const donationWallet = "HS7M3zgnFVucMMM5k1a2sPBPjRndfYNW7Ep6eMueCvX4";
const MIN_BALANCE_BUFFER_LAMPORTS = 5_000;

const headers = {
  ...ACTIONS_CORS_HEADERS,
  "x-blockchain-ids": blockchain,
  "x-action-version": "2.4",
};

export const OPTIONS = async () => {
  return new Response(null, { headers });
};

export const GET = async (req: Request) => {
  const response: ActionGetResponse = {
    type: "action",
    icon: `${new URL("/donate-sol.jpg", req.url).toString()}`,
    label: "Donate",
    title: "Donate SOL",
    description: "Support this project with a quick SOL donation. One click, instant transfer on Solana. Every bit helps! 🚀",
    links: {
      actions: [
        {
          type: "transaction",
          label: "0.1 SOL ⭐",
          href: "/api/actions/donate-sol?amount=0.1",
        },
        {
          type: "transaction",
          label: "0.05 SOL",
          href: "/api/actions/donate-sol?amount=0.05",
        },
        {
          type: "transaction",
          label: "0.01 SOL",
          href: "/api/actions/donate-sol?amount=0.01",
        },
        {
          type: "transaction",
          href: "/api/actions/donate-sol?amount={amount}",
          label: "Donate",
          parameters: [
            {
              name: "amount",
              label: "Enter a custom SOL amount",
              type: "number",
            },
          ],
        },
      ],
    },
  };

  return new Response(JSON.stringify(response), { status: 200, headers });
};

export const POST = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const amount = Number(url.searchParams.get("amount"));

    if (amount <= 0 || isNaN(amount)) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), { status: 400, headers });
    }

    const request: ActionPostRequest = await req.json();
    let payer: PublicKey;
    try {
      payer = new PublicKey(request.account);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid account provided" }), { status: 400, headers });
    }

    const receiver = new PublicKey(donationWallet);
    const transferLamports = Math.round(amount * LAMPORTS_PER_SOL);
    const { message, transaction } = await prepareTransaction(
      connection,
      payer,
      receiver,
      transferLamports
    );
    const feeLamports = await getEstimatedFee(connection, message);
    const payerBalanceLamports = await connection.getBalance(payer, "confirmed");
    const totalRequiredLamports =
      transferLamports + feeLamports + MIN_BALANCE_BUFFER_LAMPORTS;

    if (payerBalanceLamports < totalRequiredLamports) {
      return new Response(
        JSON.stringify({
          error: createInsufficientFundsMessage(
            payerBalanceLamports,
            transferLamports,
            feeLamports
          ),
        }),
        { status: 400, headers }
      );
    }

    const response: ActionPostResponse = {
      type: "transaction",
      transaction: Buffer.from(transaction.serialize()).toString("base64"),
    };

    return Response.json(response, { status: 200, headers });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers });
  }
};

const prepareTransaction = async (
  connection: Connection,
  payer: PublicKey,
  receiver: PublicKey,
  transferLamports: number
) => {
  const instruction = SystemProgram.transfer({
    fromPubkey: payer,
    toPubkey: new PublicKey(receiver),
    lamports: transferLamports,
  });

  const { blockhash } = await connection.getLatestBlockhash();

  const message = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions: [instruction],
  }).compileToV0Message();

  return {
    message,
    transaction: new VersionedTransaction(message),
  };
};

const getEstimatedFee = async (
  connection: Connection,
  message: VersionedMessage
) => {
  const fee = await connection.getFeeForMessage(message, "confirmed");
  return fee.value ?? 0;
};

const formatSol = (lamports: number) => {
  return (lamports / LAMPORTS_PER_SOL).toFixed(6);
};

const createInsufficientFundsMessage = (
  balanceLamports: number,
  transferLamports: number,
  feeLamports: number
) => {
  const totalLamports =
    transferLamports + feeLamports + MIN_BALANCE_BUFFER_LAMPORTS;

  return `Insufficient SOL balance. Wallet has ${formatSol(
    balanceLamports
  )} SOL, but needs about ${formatSol(totalLamports)} SOL (${formatSol(
    transferLamports
  )} SOL donation + network fee).`;
};
