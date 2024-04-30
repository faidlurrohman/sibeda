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
import { formatterNumber, parserNumber } from "../../helpers/number";
import { isEmpty, lower, upper } from "../../helpers/typo";
import ExportButton from "../../components/button/ExportButton";
import { getAccountList } from "../../services/account";
import { useAppSelector } from "../../hooks/useRedux";
import { PercentageOutlined } from "@ant-design/icons";
import CountUp from "react-countup";

const { RangePicker } = DatePicker;

export default function AnggaranKota() {
  const { is_super_admin } = useRole();
  const [data, setData] = useState([]);
  const [dataChart, setDataChart] = useState([]);
  const [exports, setExports] = useState([]);
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
        getRealPlanCities(params),
        getRealPlanCities({
          ...params,
          pagination: { ...params.pagination, pageSize: 0 },
        }),
        getCityList(),
        getAccountList("base"),
      ])
      .then(
        axios.spread((_data, _export, _cities, _bases) => {
          setLoading(false);
          setCities(_cities?.data);
          setData(_data?.data);
          setDataChart(_export?.data);
          setExports(setDataExport(_export?.data));
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

  const setDataExport = (data) => {
    let results = [];
    // sorting
    let srt = _.sortBy(data, [
      "account_base_label",
      "account_group_label",
      "account_type_label",
      "account_object_label",
      "account_object_detail_label",
      "account_object_detail_sub_label",
    ]);
    // grouping
    let grp = _.chain(srt)
      .groupBy("account_base_label")
      .map((base, baseKey) => ({
        account_level: 1,
        city_label: base[0]?.city_label,
        city_logo: base[0]?.city_logo,
        code: normalizeLabel(baseKey).code,
        label: upper(normalizeLabel(baseKey).label),
        plan_amount: formatterNumber(base[0]?.account_base_plan_amount),
        real_amount: formatterNumber(base[0]?.account_base_real_amount),
        percentage: sumPercentage(
          base[0]?.account_base_real_amount,
          base[0]?.account_base_plan_amount
        ),
        children: _.chain(base)
          .groupBy("account_group_label")
          .map((group, groupKey) => ({
            account_level: 2,
            code: normalizeLabel(groupKey).code,
            label: upper(normalizeLabel(groupKey).label),
            plan_amount: formatterNumber(group[0]?.account_group_plan_amount),
            real_amount: formatterNumber(group[0]?.account_group_real_amount),
            percentage: sumPercentage(
              group[0]?.account_group_real_amount,
              group[0]?.account_group_plan_amount
            ),
            children: _.chain(group)
              .groupBy("account_type_label")
              .map((type, typeKey) => ({
                account_level: 3,
                code: normalizeLabel(typeKey).code,
                label: normalizeLabel(typeKey).label,
                plan_amount: formatterNumber(type[0]?.account_type_plan_amount),
                real_amount: formatterNumber(type[0]?.account_type_real_amount),
                percentage: sumPercentage(
                  type[0]?.account_type_real_amount,
                  type[0]?.account_type_plan_amount
                ),
                children: _.chain(type)
                  .groupBy("account_object_label")
                  .map((object, objectKey) => ({
                    account_level: 4,
                    code: normalizeLabel(objectKey).code,
                    label: normalizeLabel(objectKey).label,
                    plan_amount: formatterNumber(
                      object[0]?.account_object_plan_amount
                    ),
                    real_amount: formatterNumber(
                      object[0]?.account_object_real_amount
                    ),
                    percentage: sumPercentage(
                      object[0]?.account_object_real_amount,
                      object[0]?.account_object_plan_amount
                    ),
                    children: _.chain(object)
                      .groupBy("account_object_detail_label")
                      .map((objectDetail, objectDetailKey) => ({
                        account_level: 5,
                        code: normalizeLabel(objectDetailKey).code,
                        label: normalizeLabel(objectDetailKey).label,
                        plan_amount: formatterNumber(
                          objectDetail[0]?.account_object_detail_plan_amount
                        ),
                        real_amount: formatterNumber(
                          objectDetail[0]?.account_object_detail_real_amount
                        ),
                        percentage: sumPercentage(
                          objectDetail[0]?.account_object_detail_real_amount,
                          objectDetail[0]?.account_object_detail_plan_amount
                        ),
                        children: _.map(objectDetail, (objectDetailSub) => ({
                          account_level: 6,
                          code: normalizeLabel(
                            objectDetailSub?.account_object_detail_sub_label
                          ).code,
                          label: normalizeLabel(
                            objectDetailSub?.account_object_detail_sub_label
                          ).label,
                          plan_amount: formatterNumber(
                            objectDetailSub?.account_object_detail_sub_plan_amount
                          ),
                          real_amount: formatterNumber(
                            objectDetailSub?.account_object_detail_sub_real_amount
                          ),
                          percentage: sumPercentage(
                            objectDetailSub?.account_object_detail_sub_real_amount,
                            objectDetailSub?.account_object_detail_sub_plan_amount
                          ),
                        })),
                      }))
                      .value(),
                  }))
                  .value(),
              }))
              .value(),
          }))
          .value(),
      }))
      .value();

    return results.concat(recursiveRecord(grp));
  };

  const recursiveRecord = (data, results = [], base = null, group = null) => {
    _.map(data, (item) => {
      results.push(item);

      if (item?.children && !!item.children.length) {
        recursiveRecord(item?.children, results, item?.code, item?.code);
      }

      if (item?.code !== group && item?.code.split(".").length === 2) {
        group = item?.code;
        results.push(
          {
            account_level: 0,
            code: "",
            label: `JUMLAH ${item?.label}`,
            plan_amount: item?.plan_amount,
            real_amount: item?.real_amount,
            percentage: item?.percentage,
          },
          {
            account_level: 0,
            code: "",
            label: "",
            plan_amount: "",
            real_amount: "",
            percentage: "",
          }
        );
      }

      if (item?.code !== base && item?.code.length === 1) {
        base = item?.code;

        if (base === "6") {
          let f_in = _.find(item?.children, (c) => c?.code === "6.1");
          let f_out = _.find(item?.children, (c) => c?.code === "6.2");

          let cost_in_plan = 0;
          let cost_out_plan = 0;

          let cost_in_real = 0;
          let cost_out_real = 0;

          let sum_plan = 0;
          let sum_real = 0;

          if (f_in) {
            cost_in_plan = parseInt(parserNumber(f_in?.plan_amount));
            cost_in_real = parseInt(parserNumber(f_in?.real_amount));
          }

          if (f_out) {
            cost_out_plan = parseInt(parserNumber(f_out?.plan_amount));
            cost_out_real = parseInt(parserNumber(f_out?.real_amount));
          }

          sum_plan = cost_in_plan - cost_out_plan;
          sum_real = cost_in_real - cost_out_real;

          results.push(
            {
              account_level: 0,
              code: "",
              label: `JUMLAH ${item?.label}`,
              plan_amount: formatterNumber(sum_plan),
              real_amount: formatterNumber(sum_real),
              percentage: sumPercentage(sum_real, sum_plan),
            },
            {
              account_level: 0,
              code: "",
              label: "",
              plan_amount: "",
              real_amount: "",
              percentage: "",
            }
          );
        } else {
          results.push(
            {
              account_level: 0,
              code: "",
              label: `JUMLAH ${item?.label}`,
              plan_amount: item?.plan_amount,
              real_amount: item?.real_amount,
              percentage: item?.percentage,
            },
            {
              account_level: 0,
              code: "",
              label: "",
              plan_amount: "",
              real_amount: "",
              percentage: "",
            }
          );
        }

        if (item?.code === "5" || item?.code === 5) {
          results.push(
            {
              account_level: 0,
              code: "",
              label: `SURPLUS/DEFISIT`,
              plan_amount: formatterNumber(
                parseInt(parserNumber(data[0]?.plan_amount)) -
                  parseInt(parserNumber(data[1]?.plan_amount))
              ),
              real_amount: formatterNumber(
                parseInt(parserNumber(data[0]?.real_amount)) -
                  parseInt(parserNumber(data[1]?.real_amount))
              ),
              percentage: 0,
            },
            {
              account_level: 0,
              code: "",
              label: "",
              plan_amount: "",
              real_amount: "",
              percentage: "",
            }
          );
        }
      }

      return item;
    });

    return results;
  };

  const normalizeLabel = (val) => {
    let _tf, _tl;

    _tf = val.split(" ")[0].replace(/[()]/g, "");
    _tl = val.split(" ");
    _tl.shift();

    return { code: _tf || "", label: _tl ? _tl.join(" ") : "" };
  };

  const countBy = (target, useFor) => {
    if (dataChart && !!dataChart.length) {
      let _ft = _.filter(dataChart, (o) =>
        lower(o?.account_base_label).includes(lower(target))
      );

      if (!!_ft.length) {
        if (target === "pembiayaan") {
          let _in = 0;
          let _out = 0;

          if (_ft[0]) {
            _in = _ft[0][`account_group_${useFor}_amount`];
          }

          if (_ft[1]) {
            _out = _ft[1][`account_group_${useFor}_amount`];
          }

          return parseInt(_in) - parseInt(_out);
        } else {
          return _ft[0][`account_base_${useFor}_amount`];
        }
      }

      return 0;
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
        {!!exports?.length && (cityFilter || !is_super_admin) && (
          <ExportButton
            data={exports}
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
