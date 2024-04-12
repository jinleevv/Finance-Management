import axios from "axios";
import { useAtom } from "jotai";
import { atomWithImmer } from "jotai-immer";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.withCredentials = true;

export type TableData = {
  trans_date: Date;
  billing_amount: number;
  merchant_name: string;
  category: string;
  purpose: string;
  first_name: string;
  last_name: string;
  tps: number;
  tvq: number;
};

export type BankTableData = {
  trans_date: Date;
  post_date: Date;
  billing_amount: number;
  merchant_name: string;
  first_name: string;
  last_name: string;
};

const logedInUserAtom = atomWithImmer<boolean>(false);
const userNameAtom = atomWithImmer<string>("");
const userEmailAtom = atomWithImmer<string>("");
const tableDataAtom = atomWithImmer<Array<TableData>>([]);
const missingTableDataAtom = atomWithImmer<Array<TableData>>([]);
const bankTableDataAtom = atomWithImmer<Array<BankTableData>>([]);
const missingBankTableDataAtom = atomWithImmer<Array<BankTableData>>([]);
const matchingTransactionsDataAtom = atomWithImmer<Array<BankTableData>>([]);
const departmentAtom = atomWithImmer<string>("");

export function useHooks() {
  const clientI = axios.create({
    // baseURL: "http://127.0.0.1:8000",
    // baseURL: "http://card.ultiumcam.local:8000",
    baseURL: "http://192.168.3.248:8000",
  });
  const clientII = axios.create({
    // baseURL: "http://localhost:8000",
    // baseURL: "http://127.0.0.1:8000",
    baseURL: "http://card.ultiumcam.local:8000",
  });
  // const urlII = "http://localhost:8000";
  const urlII = "http://card.ultiumcam.local:8000";

  const [logedInUser, setLogedInUser] = useAtom(logedInUserAtom);
  const [userName, setUserName] = useAtom(userNameAtom);
  const [userEmail, setUserEmail] = useAtom(userEmailAtom);
  const [tableData, setTableData] = useAtom(tableDataAtom);
  const [missingTableData, setMissingTableData] = useAtom(missingTableDataAtom);
  const [bankTableData, setBankTableData] = useAtom(bankTableDataAtom);
  const [missingBankTableData, setMissingBankTableData] = useAtom(
    missingBankTableDataAtom
  );
  const [matchingTableData, setMatchingTableData] = useAtom(
    matchingTransactionsDataAtom
  );
  const [department, setDepartment] = useAtom(departmentAtom);
  return {
    clientI,
    clientII,
    urlII,
    logedInUser,
    setLogedInUser,
    userName,
    setUserName,
    userEmail,
    setUserEmail,
    tableData,
    setTableData,
    missingTableData,
    setMissingTableData,
    bankTableData,
    setBankTableData,
    missingBankTableData,
    setMissingBankTableData,
    matchingTableData,
    setMatchingTableData,
    department,
    setDepartment,
  };
}
