import {
  App,
  Button,
  Card,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Table,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { PAGINATION } from "../../../helpers/constants";
import { actionColumn, searchColumn } from "../../../helpers/table";
import ReloadButton from "../../../components/button/ReloadButton";
import AddButton from "../../../components/button/AddButton";
import ExportButton from "../../../components/button/ExportButton";
import { messageAction } from "../../../helpers/response";
import { getCityList } from "../../../services/city";
import { viewDate } from "../../../helpers/date";
import axios from "axios";
import useRole from "../../../hooks/useRole";
import { formatterNumber, parserNumber } from "../../../helpers/number";
import { lower } from "../../../helpers/typo";
import {
  addPlan,
  getAccountObjectDetailSub,
  getLastPlan,
  getPlan,
  removePlan,
} from "../../../services/plan";
import { useAppSelector } from "../../../hooks/useRedux";
import ImportBudgetButton from "../../../components/button/ImportBudgetButton";

export default function AnggaranPendapatan() {
  const { modal } = App.useApp();
  const { is_super_admin } = useRole();
  const [form] = Form.useForm();
  const session = useAppSelector((state) => state.session.user);

  const [transactions, setTransactions] = useState([]);
  const [cities, setCities] = useState([]);
  const [accountObjectDetailSub, setAccountObjectDetailSub] = useState([]);
  const [lastTransaction, setLastTransaction] = useState({});
  const [lastTransactionLoading, setLastTransactionLoading] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(false);

  const tableFilterInputRef = useRef(null);
  const [tableFiltered, setTableFiltered] = useState({});
  const [tableSorted, setTableSorted] = useState({});
  const [tablePage, setTablePage] = useState(PAGINATION);

  const [isEdit, setEdit] = useState(false);
  const [isShow, setShow] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const getData = (params) => {
    setLoading(true);
    axios
      .all([
        getPlan("in", params),
        getPlan("in", {
          ...params,
          pagination: { ...params.pagination, pageSize: 0 },
        }),
        getCityList(),
        getAccountObjectDetailSub("in"),
      ])
      .then(
        axios.spread((_plan, _export, _cities, _objects) => {
          setLoading(false);
          setTransactions(_plan?.data);
          setExports(_export?.data);
          setCities(_cities?.data);
          setAccountObjectDetailSub(_objects?.data);
          setTablePage({
            pagination: { ...params.pagination, total: _plan?.total },
          });
        })
      );
  };

  const onTableChange = (pagination, filters, sorter) => {
    setTableFiltered(filters);
    setTableSorted(sorter);
    getData({
      pagination,
      filters: { ...filters },
      ...sorter,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tablePage.pagination?.pageSize) {
      setTransactions([]);
    }
  };

  const reloadTable = () => {
    setTableFiltered({});
    setTableSorted({});
    getData(PAGINATION);
  };

  const addUpdateRow = (isEdit = false, value = null) => {
    setShow(!isShow);
    setShowCard(false);
    setLastTransaction({});

    if (isEdit) {
      setEdit(true);
      form.setFieldsValue({
        id: value?.id,
        amount: value?.amount,
        account_object_detail_sub_id: value?.account_object_detail_sub_id,
      });
    } else {
      form.resetFields();
      setEdit(false);
    }
  };

  const onDelete = (value) => {
    modal.confirm({
      title: "Hapus data :",
      content: (
        <>
          {value?.city_label} - {value?.account_object_detail_sub_label}
        </>
      ),
      okText: "Ya",
      cancelText: "Tidak",
      centered: true,
      onOk() {
        removePlan(value?.id).then((response) => {
          if (response?.code === 200) {
            messageAction(false, true);
            reloadTable();
          }
        });
      },
    });
  };

  const handleAddUpdate = (values) => {
    let cur = {
      ...values,
      mode: isEdit ? "U" : "C",
      city_id: !!cities.length ? cities[0]?.id : 0,
    };

    setConfirmLoading(true);
    addPlan(cur).then((response) => {
      setConfirmLoading(false);

      if (response?.code === 200) {
        messageAction(isEdit);
        setShow(false);
        reloadTable();
      }
    });
  };

  const handleObjectChange = (value) => {
    setLastTransactionLoading(true);
    getLastPlan("in", {
      account_object_detail_sub_id: value,
    }).then((response) => {
      setLastTransactionLoading(false);

      if (response?.code === 200 && response?.total > 0) {
        setShowCard(true);
        setLastTransaction(response?.data[0]);
      } else {
        setShowCard(false);
        setLastTransaction({});
      }
    });
  };

  const columnsSuperAdmin = [
    searchColumn(
      tableFilterInputRef,
      "city_label",
      "Kab/Kota",
      tableFiltered,
      true,
      tableSorted
    ),
    searchColumn(
      tableFilterInputRef,
      "account_object_detail_sub_label",
      "Objek Detail Sub Rekening",
      tableFiltered,
      true,
      tableSorted
    ),
    searchColumn(
      tableFilterInputRef,
      "amount",
      "Anggaran",
      tableFiltered,
      true,
      tableSorted,
      "int"
    ),
  ];

  const columnsAdminCity = [
    searchColumn(
      tableFilterInputRef,
      "account_object_detail_sub_label",
      "Objek Detail Sub Rekening",
      tableFiltered,
      true,
      tableSorted
    ),
    searchColumn(
      tableFilterInputRef,
      "amount",
      "Anggaran",
      tableFiltered,
      true,
      tableSorted,
      "int"
    ),
    actionColumn(addUpdateRow, null, onDelete),
  ];

  useEffect(() => getData(PAGINATION), []);

  return (
    <>
      <div className="flex flex-col mb-2 space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-row md:space-y-0 md:space-x-2 md:flex-row">
        <ReloadButton onClick={reloadTable} stateLoading={loading} />
        {!is_super_admin && (
          <AddButton onClick={addUpdateRow} stateLoading={loading} />
        )}
        {!!exports?.length && (
          <ExportButton
            data={exports}
            master={`budget`}
            pdfOrientation={`landscape`}
          />
        )}
        {!is_super_admin && (
          <ImportBudgetButton
            type="in"
            year={session?.which_year}
            city={!!cities.length ? cities[0]?.id : 0}
            onFinish={() => reloadTable()}
          />
        )}
      </div>
      <Table
        scroll={{
          scrollToFirstRowOnChange: true,
          x: "100%",
        }}
        bordered
        size="small"
        loading={loading}
        dataSource={transactions}
        columns={!is_super_admin ? columnsAdminCity : columnsSuperAdmin}
        rowKey={(record) => record?.id}
        onChange={onTableChange}
        pagination={tablePage.pagination}
        tableLayout="auto"
      />
      <Modal
        style={{ margin: 10 }}
        centered
        open={isShow}
        title={`${isEdit ? `Ubah` : `Tambah`} Data Anggaran Pendapatan`}
        onCancel={() => (confirmLoading ? null : setShow(false))}
        closable={false}
        footer={null}
      >
        <Spin spinning={lastTransactionLoading}>
          <Divider />
          {showCard && (
            <Card className="mb-4">
              <h4 className="text-center p-0 mt-0">Riwayat Data Terakhir</h4>
              <div className="flex flex-1 flex-row space-x-7">
                <div className="flex-0 flex-col space-y-2">
                  <div>
                    <h4 className="md:inline">{`Tanggal`}</h4>
                  </div>
                  <div>
                    <h4 className="md:inline">{`Anggaran (Rp)`}</h4>
                  </div>
                </div>
                <div className="flex-1 flex-col space-y-2">
                  <div>
                    <h4 className="md:inline">
                      :{" "}
                      {lastTransaction?.date
                        ? viewDate(lastTransaction?.date)
                        : `-`}
                    </h4>
                  </div>
                  <div>
                    <h4 className="md:inline">
                      :{" "}
                      {lastTransaction?.amount >= 0
                        ? formatterNumber(lastTransaction?.amount || 0)
                        : `-`}
                    </h4>
                  </div>
                </div>
              </div>
            </Card>
          )}
          <Form
            form={form}
            labelCol={{ span: 9 }}
            labelAlign="left"
            onFinish={handleAddUpdate}
            autoComplete="off"
            initialValues={{
              id: "",
              amount: 0,
            }}
          >
            <Form.Item name="id" hidden>
              <Input />
            </Form.Item>
            <Form.Item
              label="Objek Detail Sub Rekening"
              name="account_object_detail_sub_id"
              rules={[
                {
                  required: isEdit ? false : true,
                  message: "Objek Detail Sub Rekening tidak boleh kosong!",
                },
              ]}
              hidden={isEdit}
            >
              <Select
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (lower(option?.label) ?? "").includes(lower(input))
                }
                disabled={confirmLoading}
                loading={loading}
                options={accountObjectDetailSub}
                onChange={handleObjectChange}
              />
            </Form.Item>
            <Form.Item
              label="Anggaran (Rp)"
              name="amount"
              rules={[
                {
                  required: true,
                  message: "Anggaran tidak boleh kosong!",
                },
                () => ({
                  validator(_, value) {
                    if (value < 0) {
                      return Promise.reject("Anggaran minus");
                    } else {
                      return Promise.resolve();
                    }
                  },
                }),
              ]}
            >
              <InputNumber
                className="w-full"
                disabled={confirmLoading}
                formatter={(value) => formatterNumber(value)}
                parser={(value) => parserNumber(value)}
              />
            </Form.Item>
            <Divider />
            <Form.Item className="text-right mb-0">
              <Space direction="horizontal">
                <Button
                  disabled={confirmLoading}
                  onClick={() => setShow(false)}
                >
                  Kembali
                </Button>
                <Button
                  loading={confirmLoading}
                  htmlType="submit"
                  type="primary"
                >
                  Simpan
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </>
  );
}
