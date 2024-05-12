import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Card,
  DatePicker,
  Progress,
  Select,
  Space,
  Statistic,
  Table,
} from "antd";
import { COLORS, DATE_FORMAT_VIEW, PAGINATION } from "../../helpers/constants";
import { searchColumn } from "../../helpers/table";
import axios from "axios";
import { getRealPlanCities } from "../../services/report";
import ReloadButton from "../../components/button/ReloadButton";
import { convertDate, dbDate } from "../../helpers/date";
import useRole from "../../hooks/useRole";
import { getCityList } from "../../services/city";
import _ from "lodash";
import { isEmpty, lower } from "../../helpers/typo";
import ExportButton from "../../components/button/ExportButton";
import { getAccountList } from "../../services/account";
import { useAppSelector } from "../../hooks/useRedux";
import { PercentageOutlined } from "@ant-design/icons";
import CountUp from "react-countup";
import { getCost, getInOut } from "../../services/dashboard";

const { RangePicker } = DatePicker;

export default function AnggaranKota() {
  const { is_super_admin } = useRole();
  const [data, setData] = useState([]);
  const [dataChart, setDataChart] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const session = useAppSelector((state) => state.session.user);

  const tableFilterInputRef = useRef(null);
  const [tablePage, setTablePage] = useState(PAGINATION);
  const [tableFiltered, setTableFiltered] = useState({});
  const [tableSorted, setTableSorted] = useState({});
  const [dateRangeFilter, setDateRangeFilter] = useState([
    convertDate(`${session?.which_year}`).startOf("year"),
    convertDate(`${session?.which_year}`).endOf("year"),
  ]);
  const [cityFilter, setCityFilter] = useState(null);

  const getData = (params) => {
    setLoading(true);
    axios
      .all([
        getInOut({
          ...params,
          pagination: { ...params.pagination, pageSize: 0 },
        }),
        getCost({
          ...params,
          pagination: { ...params.pagination, pageSize: 0 },
        }),
        getRealPlanCities(params),
        getCityList(),
        getAccountList("base"),
      ])
      .then(
        axios.spread((_inOut, _cost, _data, _cities, _bases) => {
          setLoading(false);
          setCities(_cities?.data);
          setDataChart(_.concat(_inOut?.data, _cost?.data));
          setData(_data?.data);
          setTablePage({
            pagination: { ...params.pagination, total: _data?.total },
          });

          if (!!(_bases?.data).length) {
          }
        })
      );
  };

  const reloadTable = () => {
    setTableFiltered({});
    setTableSorted({});
    setDateRangeFilter([
      convertDate(`${session?.which_year}`).startOf("year"),
      convertDate(`${session?.which_year}`).endOf("year"),
    ]);
    setCityFilter(null);
    getData({
      ...PAGINATION,
      filters: {
        trans_date: [
          [
            dbDate(convertDate(`${session?.which_year}`).startOf("year")),
            dbDate(convertDate(`${session?.which_year}`).endOf("year")),
          ],
        ],
        ...(is_super_admin && { city_id: null }),
      },
    });
  };

  const onTableChange = (pagination, filters, sorter) => {
    setTableFiltered(filters);
    setTableSorted(sorter);
    getData({
      pagination,
      filters: {
        ...filters,
        trans_date: [[dbDate(dateRangeFilter[0]), dbDate(dateRangeFilter[1])]],
        ...(is_super_admin && { city_id: cityFilter ? [cityFilter] : null }),
      },
      ...sorter,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tablePage.pagination?.pageSize) {
      setData([]);
    }
  };

  const onDateRangeChange = (values) => {
    let useStart = values[0];
    let useEnd = values[1];
    let startYear = convertDate(useStart, "YYYY");
    let endYear = convertDate(useEnd, "YYYY");

    if (startYear !== endYear) {
      useEnd = convertDate(useStart).endOf("year");
      setDateRangeFilter([useStart, useEnd]);
    } else {
      setDateRangeFilter(values);
    }

    setTableFiltered({});
    setTableSorted({});
    getData({
      ...PAGINATION,
      filters: {
        trans_date: [[dbDate(useStart), dbDate(useEnd)]],
        ...(is_super_admin && { city_id: cityFilter ? [cityFilter] : null }),
      },
    });
  };

  const onCityChange = (value) => {
    setCityFilter(value);
    setTableFiltered({});
    setTableSorted({});
    getData({
      ...PAGINATION,
      filters: {
        trans_date: [[dbDate(dateRangeFilter[0]), dbDate(dateRangeFilter[1])]],
        ...(is_super_admin && { city_id: value ? [value] : null }),
      },
    });
  };

  const countBy = (target, useFor) => {
    if (dataChart && !!dataChart.length) {
      let _ft = _.filter(dataChart, (o) =>
        lower(o?.account_base_label).includes(lower(target))
      );

      return _.sumBy(_ft, (item) =>
        Number(item[`account_base_${useFor}_amount`])
      );
    } else {
      return 0;
    }
  };

  const sumPercentage = (value1 = 0, value2 = 0, results = 0) => {
    if (isEmpty(value1)) value1 = 0;
    if (isEmpty(value2)) value2 = 0;

    results = parseFloat((value1 / value2) * 100).toFixed(0);

    if (isNaN(results) || !isFinite(Number(results))) return 0;

    return results;
  };

  const columnsSuperAdmin = [
    searchColumn(
      tableFilterInputRef,
      "trans_date",
      "Tanggal",
      null,
      true,
      tableSorted
    ),
    searchColumn(
      tableFilterInputRef,
      "city_label",
      "Kab/Kota",
      null,
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
      "account_object_detail_sub_plan_amount",
      "Anggaran",
      tableFiltered,
      true,
      tableSorted,
      "int"
    ),
    searchColumn(
      tableFilterInputRef,
      "account_object_detail_sub_real_amount",
      "Realisasi",
      tableFiltered,
      true,
      tableSorted,
      "int"
    ),
  ];

  const columnsAdminCity = [
    searchColumn(
      tableFilterInputRef,
      "trans_date",
      "Tanggal",
      null,
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
      "account_object_detail_sub_plan_amount",
      "Anggaran",
      tableFiltered,
      true,
      tableSorted,
      "int"
    ),
    searchColumn(
      tableFilterInputRef,
      "account_object_detail_sub_real_amount",
      "Realisasi",
      tableFiltered,
      true,
      tableSorted,
      "int"
    ),
  ];

  useEffect(() => reloadTable(), []);

  return (
    <>
      <div className="flex flex-col mb-1 space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-row md:space-y-0 md:space-x-2 md:flex-row">
        <div className="flex flex-row md:space-x-2">
          <h2 className="text-xs font-normal text-right w-14 hidden md:inline">
            Tanggal :
          </h2>
          <RangePicker
            popupClassName="dateRangePicker"
            className="w-full h-8 md:w-72"
            allowEmpty={false}
            allowClear={false}
            format={DATE_FORMAT_VIEW}
            defaultValue={dateRangeFilter}
            placeholder={["Tanggal Awal", "Tanggal Akhir"]}
            onChange={onDateRangeChange}
            value={dateRangeFilter}
            disabledDate={(curr) => {
              const useYear =
                curr &&
                convertDate(curr, "YYYY") !== String(session?.which_year);

              return useYear;
            }}
          />
        </div>
        {is_super_admin && (
          <div className="flex flex-row md:space-x-2">
            <h2 className="text-xs font-normal text-right w-20 hidden md:inline">
              Kab/Kota :
            </h2>
            <Select
              allowClear
              showSearch
              className="w-full h-8 sm:w-60 md:w-60"
              placeholder="Pilih Kab/Kota"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (lower(option?.label) ?? "").includes(lower(input))
              }
              loading={loading}
              options={cities}
              onChange={onCityChange}
              value={cityFilter}
            />
          </div>
        )}
        <ReloadButton onClick={reloadTable} stateLoading={loading} />
        {!!data?.length && (cityFilter || !is_super_admin) && (
          <ExportButton
            city_id={cityFilter}
            date={dateRangeFilter}
            report={`kota`}
            pdfOrientation="landscape"
            fileName="LAPORAN-REALISASI-ANGGARAN-KAB/KOTA"
          />
        )}
      </div>
      <div className="flex flex-col mx-0.5 pb-2 space-x-0 space-y-2 md:space-x-2 md:space-y-0 md:flex-row">
        {/* PENDAPATAN DAERAH */}
        <Card
          loading={loading}
          size="small"
          title={
            <Space>
              <Avatar
                size="small"
                className="bg-success"
                icon={<PercentageOutlined />}
              />
              <span className="text-xs">PENDAPATAN DAERAH</span>
            </Space>
          }
          className="text-center w-full md:w-1/3 md:text-left"
        >
          <Statistic
            prefix={
              <span className="text-xs">
                Anggaran<span className="pl-9">:</span>
              </span>
            }
            value={countBy("pendapatan", "plan")}
            formatter={(value) => (
              <CountUp
                end={value}
                className="text-xs font-bold"
                prefix="Rp. "
              />
            )}
          />
          <Statistic
            prefix={
              <span className="text-xs">
                Realisasi<span className="pl-10">:</span>
              </span>
            }
            value={countBy("pendapatan", "real")}
            formatter={(value) => (
              <CountUp
                end={value}
                className="text-xs font-bold"
                prefix="Rp. "
              />
            )}
          />
          <div className="h-auto w-auto pt-2">
            <Progress
              className="font-bold"
              format={() =>
                `${sumPercentage(
                  countBy("pendapatan", "real"),
                  countBy("pendapatan", "plan")
                )}%`
              }
              percent={sumPercentage(
                countBy("pendapatan", "real"),
                countBy("pendapatan", "plan")
              )}
              size={[_, 25]}
              strokeColor={COLORS.success}
              status="normal"
            />
          </div>
        </Card>
        {/* BELANJA DAERAH */}
        <Card
          loading={loading}
          size="small"
          title={
            <Space>
              <Avatar
                size="small"
                className="bg-danger"
                icon={<PercentageOutlined />}
              />
              <span className="text-xs">BELANJA DAERAH</span>
            </Space>
          }
          className="text-center w-full md:w-1/3 md:text-left"
        >
          <Statistic
            prefix={
              <span className="text-xs">
                Anggaran<span className="pl-9">:</span>
              </span>
            }
            value={countBy("belanja", "plan")}
            formatter={(value) => (
              <CountUp
                end={value}
                className="text-xs font-bold"
                prefix="Rp. "
              />
            )}
          />
          <Statistic
            prefix={
              <span className="text-xs">
                Realisasi<span className="pl-10">:</span>
              </span>
            }
            value={countBy("belanja", "real")}
            formatter={(value) => (
              <CountUp
                end={value}
                className="text-xs font-bold"
                prefix="Rp. "
              />
            )}
          />
          <div className="h-auto w-auto pt-2">
            <Progress
              className="font-bold"
              format={() =>
                `${sumPercentage(
                  countBy("belanja", "real"),
                  countBy("belanja", "plan")
                )}%`
              }
              percent={sumPercentage(
                countBy("belanja", "real"),
                countBy("belanja", "plan")
              )}
              size={[_, 25]}
              strokeColor={COLORS.danger}
              status="normal"
            />
          </div>
        </Card>
        {/* PEMBIAYAAN DAERAH */}
        <Card
          loading={loading}
          size="small"
          title={
            <Space>
              <Avatar
                size="small"
                className="bg-info"
                icon={<PercentageOutlined />}
              />
              <span className="text-xs">PEMBIAYAAN DAERAH</span>
            </Space>
          }
          className="text-center w-full md:w-1/3 md:text-left"
        >
          <Statistic
            prefix={
              <span className="text-xs">
                Anggaran<span className="pl-9">:</span>
              </span>
            }
            value={countBy("pembiayaan", "plan")}
            formatter={(value) => (
              <CountUp
                end={value}
                className="text-xs font-bold"
                prefix="Rp. "
              />
            )}
          />
          <Statistic
            prefix={
              <span className="text-xs">
                Realisasi<span className="pl-10">:</span>
              </span>
            }
            value={countBy("pembiayaan", "real")}
            formatter={(value) => (
              <CountUp
                end={value}
                className="text-xs font-bold"
                prefix="Rp. "
              />
            )}
          />
          <div className="h-auto w-auto pt-2">
            <Progress
              className="font-bold"
              format={() =>
                `${sumPercentage(
                  countBy("pembiayaan", "real"),
                  countBy("pembiayaan", "plan")
                )}%`
              }
              percent={sumPercentage(
                countBy("pembiayaan", "real"),
                countBy("pembiayaan", "plan")
              )}
              size={[_, 25]}
              strokeColor={COLORS.info}
              status="normal"
            />
          </div>
        </Card>
      </div>
      <Table
        scroll={{
          scrollToFirstRowOnChange: true,
          x: "100%",
        }}
        bordered
        size="small"
        loading={loading}
        dataSource={data}
        columns={!is_super_admin ? columnsAdminCity : columnsSuperAdmin}
        rowKey={(record) =>
          `${record?.account_object_detail_sub_id}_${record?.city_id}`
        }
        onChange={onTableChange}
        pagination={tablePage.pagination}
        tableLayout="auto"
      />
    </>
  );
}
