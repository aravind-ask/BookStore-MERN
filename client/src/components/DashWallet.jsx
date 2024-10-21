import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Table, Badge } from "flowbite-react";
import { FaWallet, FaArrowUp, FaArrowDown } from "react-icons/fa";

export default function DashWallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch wallet data (replace with your actual API call)
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const response = await axios.get("/api/wallet");
        setBalance(response.data.balance);
        setTransactions(response.data.transactions);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch wallet data");
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaWallet className="text-4xl text-blue-600 mr-4" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">My Wallet</h2>
              <p className="text-sm text-gray-500">ID: </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Current Balance:</p>
            <p className="text-3xl font-bold text-blue-600">
              ${balance.toFixed(2)}
            </p>
            <Badge color="success" className="mt-2">
              Active
            </Badge>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold mb-4">Transaction History</h3>
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Type</Table.HeadCell>
            <Table.HeadCell>Amount</Table.HeadCell>
            <Table.HeadCell>Description</Table.HeadCell>
            <Table.HeadCell>Date</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {transactions.map((transaction) => (
              <Table.Row
                key={transaction.id}
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <Table.Cell>
                  {transaction.type === "credit" ? (
                    <Badge color="success" icon={FaArrowUp}>
                      Credit
                    </Badge>
                  ) : (
                    <Badge color="failure" icon={FaArrowDown}>
                      Debit
                    </Badge>
                  )}
                </Table.Cell>
                <Table.Cell className="font-medium text-gray-900 dark:text-white">
                  ${transaction.amount.toFixed(2)}
                </Table.Cell>
                <Table.Cell>{transaction.description}</Table.Cell>
                <Table.Cell>{transaction.date}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
}
