import {
  Button,
  DatePicker,
  Divider,
  Dropdown,
  Form,
  Modal,
  Select,
  Space,
} from "antd";
import { DownOutlined, ExportOutlined } from "@ant-design/icons";
import { convertDate, dbDate, viewDate } from "../../helpers/date";
import { isEmpty, lower, upper } from "../../helpers/typo";
import {
  DATE_FORMAT_VIEW,
  EXPORT_TARGET,
  PAGINATION,
} from "../../helpers/constants";
import { pdf } from "@react-pdf/renderer";
import PDFFile from "../PDFFile";
import { saveAs } from "file-saver";
import useRole from "../../hooks/useRole";
import { getSignerList } from "../../services/signer";
import { useEffect, useState } from "react";
import _ from "lodash";
import logoKemendagri from "../../assets/images/logo-kemendagri.png";
import axios from "axios";
import axiosInstance from "../../services/axios";
import { formatterNumber, parserNumber } from "../../helpers/number";
import { addExportLog } from "../../services/export";
import {
  getRealPlanCities,
  getRecapitulationCities,
} from "../../services/report";

const ExcelJS = require("exceljs");

const account_level = [
  { id: 1, value: "Akun" },
  { id: 2, value: "Kelompok" },
  { id: 3, value: "Jenis" },
  { id: 4, value: "Objek" },
  { id: 5, value: "Objek Detail" },
  { id: 6, value: "Objek Detail Sub" },
];

export default function ExportButton({
  master = null,
  report = null,
  data = [],
  sheetTitle = "MY SHEET",
  fileName = "FILE-",
  pdfOrientation = "portrait",
  date = null,
  types = ["xlsx", "pdf"],
  city_id = null,
}) {
  const { is_super_admin } = useRole();
  const [form] = Form.useForm();
  const [signers, setSigners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [accountModal, setAccountModal] = useState(false);
  const [signerModal, setSignerModal] = useState(false);
  const [doNext, setDoNext] = useState(null);

  // getting data for exports
  const collect = (formValues = {}) => {
    // anngaran kota
    if (report === "kota" || report === "gabungankota") {
      setLoadingPdf(true);
      setLoading(true);
      getRealPlanCities({
        pagination: { ...PAGINATION.pagination, pageSize: 0 },
        filters: {
          trans_date: [[dbDate(date[0]), dbDate(date[1])]],
          ...(is_super_admin && { city_id: city_id ? [city_id] : null }),
        },
      }).then((response) => {
        if (doNext === "xlsx") {
          xlsx(formValues, set(response?.data));
        } else if (doNext === "pdfx") {
          pdfx(formValues, set(response?.data));
        }
      });
    } else if (report === "rekapitulasi") {
      setLoadingPdf(true);
      setLoading(true);
      getRecapitulationCities({
        pagination: { ...PAGINATION.pagination, pageSize: 0 },
        filters: {
          trans_date: [[dbDate(date[0]), dbDate(date[1])]],
          ...(is_super_admin && { city_id: city_id ? [city_id] : null }),
        },
      }).then((response) => {
        if (doNext === "xlsx") {
          xlsx(formValues, set(response?.data));
        } else if (doNext === "pdfx") {
          pdfx(formValues, set(response?.data));
        }
      });
    } else {
      if (doNext === "xlsx") {
        xlsx(formValues, data);
      } else if (doNext === "pdfx") {
        pdfx(formValues, data);
      }
    }
  };

  // set data before make export file
  const set = (data) => {
    let results = [];

    if (report === "kota") {
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
                  plan_amount: formatterNumber(
                    type[0]?.account_type_plan_amount
                  ),
                  real_amount: formatterNumber(
                    type[0]?.account_type_real_amount
                  ),
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
    } else if (report === "gabungankota") {
      results = { cities: {}, codes: [], data: [] };

      // sorting
      let srt = _.sortBy(data, [
        "city_label",
        "account_base_label",
        "account_group_label",
        "account_type_label",
        "account_object_label",
        "account_object_detail_label",
        "account_object_detail_sub_label",
      ]);

      // take all city
      results.cities = _.chain(srt)
        .groupBy("city_label")
        .map((values, label) => ({
          city: label,
          city_id: values[0].city_id,
          children: values,
        }))
        .value();

      // take all codes
      results.codes = recursiveRecord(
        _.chain(_.uniqBy(srt, "account_object_label"))
          .groupBy("account_base_label")
          .map((base, baseKey) => ({
            level: 1,
            code: normalizeLabel(baseKey).code,
            label: upper(normalizeLabel(baseKey).label),
            origin: baseKey,
            children: _.chain(base)
              .groupBy("account_group_label")
              .map((group, groupKey) => ({
                level: 2,
                code: normalizeLabel(groupKey).code,
                label: upper(normalizeLabel(groupKey).label),
                origin: groupKey,
                children: _.chain(group)
                  .groupBy("account_type_label")
                  .map((type, typeKey) => ({
                    level: 3,
                    code: normalizeLabel(typeKey).code,
                    label: normalizeLabel(typeKey).label,
                    origin: typeKey,
                    children: _.chain(type)
                      .groupBy("account_object_label")
                      .map((object, objectKey) => ({
                        level: 4,
                        code: normalizeLabel(objectKey).code,
                        label: normalizeLabel(objectKey).label,
                        origin: objectKey,
                        children: _.chain(object)
                          .groupBy("account_object_detail_label")
                          .map((objectDetail, objectDetailKey) => ({
                            level: 5,
                            code: normalizeLabel(objectDetailKey).code,
                            label: normalizeLabel(objectDetailKey).label,
                            origin: objectDetailKey,
                            children: _.map(
                              objectDetail,
                              (objectDetailSub) => ({
                                level: 6,
                                code: normalizeLabel(
                                  objectDetailSub?.account_object_detail_sub_label
                                ).code,
                                label: normalizeLabel(
                                  objectDetailSub?.account_object_detail_sub_label
                                ).label,
                                origin:
                                  objectDetailSub?.account_object_detail_sub_label,
                              })
                            ),
                          }))
                          .value(),
                      }))
                      .value(),
                  }))
                  .value(),
              }))
              .value(),
          }))
          .value()
      );

      // set data per-city
      _.map(results.codes, (codes) => {
        let d = { code: codes?.code, label: codes?.label };
        _.map(results?.cities, (cities) => {
          let fb = cities?.children.find(
            (i) => i?.account_base_label === codes?.origin
          );
          let fg = cities?.children.find(
            (i) => i?.account_group_label === codes?.origin
          );
          let ft = cities?.children.find(
            (i) => i?.account_type_label === codes?.origin
          );
          let fo = cities?.children.find(
            (i) => i?.account_object_label === codes?.origin
          );
          let fod = cities?.children.find(
            (i) => i?.account_object_detail_label === codes?.origin
          );
          let fods = cities?.children.find(
            (i) => i?.account_object_detail_sub_label === codes?.origin
          );

          if (fods) {
            d["account_level"] = 6;
            d[`${cities?.city_id}_plan_amount`] = formatterNumber(
              fods?.account_object_detail_sub_plan_amount
            );
            d[`${cities?.city_id}_real_amount`] = formatterNumber(
              fods?.account_object_detail_sub_real_amount
            );
            d[`${cities?.city_id}_percentage`] = sumPercentage(
              fods?.account_object_detail_sub_real_amount,
              fods?.account_object_detail_sub_plan_amount
            );
          } else if (fod) {
            d["account_level"] = 5;
            d[`${cities?.city_id}_plan_amount`] = formatterNumber(
              fod?.account_object_detail_plan_amount
            );
            d[`${cities?.city_id}_real_amount`] = formatterNumber(
              fod?.account_object_detail_real_amount
            );
            d[`${cities?.city_id}_percentage`] = sumPercentage(
              fod?.account_object_detail_real_amount,
              fod?.account_object_detail_plan_amount
            );
          } else if (fo) {
            d["account_level"] = 4;
            d[`${cities?.city_id}_plan_amount`] = formatterNumber(
              fo?.account_object_plan_amount
            );
            d[`${cities?.city_id}_real_amount`] = formatterNumber(
              fo?.account_object_real_amount
            );
            d[`${cities?.city_id}_percentage`] = sumPercentage(
              fo?.account_object_real_amount,
              fo?.account_object_plan_amount
            );
          } else if (ft) {
            d["account_level"] = 3;
            d[`${cities?.city_id}_plan_amount`] = formatterNumber(
              ft?.account_type_plan_amount
            );
            d[`${cities?.city_id}_real_amount`] = formatterNumber(
              ft?.account_type_real_amount
            );
            d[`${cities?.city_id}_percentage`] = sumPercentage(
              ft?.account_type_real_amount,
              ft?.account_type_plan_amount
            );
          } else if (fg) {
            d["account_level"] = 2;
            d[`${cities?.city_id}_plan_amount`] = formatterNumber(
              fg?.account_group_plan_amount
            );
            d[`${cities?.city_id}_real_amount`] = formatterNumber(
              fg?.account_group_real_amount
            );
            d[`${cities?.city_id}_percentage`] = sumPercentage(
              fg?.account_group_real_amount,
              fg?.account_group_plan_amount
            );
          } else if (fb) {
            d["account_level"] = 1;

            if (d.label === "SURPLUS/DEFISIT") {
              let def_in = cities?.children.find((i) =>
                i?.account_base_label.includes("(4)")
              );
              let def_out = cities?.children.find((i) =>
                i?.account_base_label.includes("(5)")
              );

              let def_in_plan = 0;
              let def_out_plan = 0;

              let def_in_real = 0;
              let def_out_real = 0;

              if (def_in) {
                def_in_plan = parseInt(def_in?.account_base_plan_amount);

                def_in_real = parseInt(def_in?.account_base_real_amount);
              }

              if (def_out) {
                def_out_plan = parseInt(def_out?.account_base_plan_amount);

                def_out_real = parseInt(def_out?.account_base_real_amount);
              }

              d[`${cities?.city_id}_plan_amount`] = formatterNumber(
                def_in_plan - def_out_plan
              );
              d[`${cities?.city_id}_real_amount`] = formatterNumber(
                def_in_real - def_out_real
              );
              d[`${cities?.city_id}_percentage`] = 0;
            } else if (d.label === "JUMLAH PEMBIAYAAN DAERAH") {
              let cost_in = cities?.children.find((i) =>
                i?.account_group_label.includes("(6.1)")
              );
              let cost_out = cities?.children.find((i) =>
                i?.account_group_label.includes("(6.2)")
              );

              let cost_in_plan = 0;
              let cost_out_plan = 0;

              let cost_in_real = 0;
              let cost_out_real = 0;

              let sum_cost_plan = 0;
              let sum_cost_real = 0;

              if (cost_in) {
                cost_in_plan = parseInt(cost_in?.account_group_plan_amount);
                cost_in_real = parseInt(cost_in?.account_group_real_amount);
              }

              if (cost_out) {
                cost_out_plan = parseInt(cost_out?.account_group_plan_amount);
                cost_out_real = parseInt(cost_out?.account_group_real_amount);
              }

              sum_cost_plan = cost_in_plan - cost_out_plan;
              sum_cost_real = cost_in_real - cost_out_real;

              d[`${cities?.city_id}_plan_amount`] =
                formatterNumber(sum_cost_plan);
              d[`${cities?.city_id}_real_amount`] =
                formatterNumber(sum_cost_real);
              d[`${cities?.city_id}_percentage`] = sumPercentage(
                sum_cost_real,
                sum_cost_plan
              );
            } else {
              d[`${cities?.city_id}_plan_amount`] = formatterNumber(
                fb?.account_base_plan_amount
              );
              d[`${cities?.city_id}_real_amount`] = formatterNumber(
                fb?.account_base_real_amount
              );
              d[`${cities?.city_id}_percentage`] = sumPercentage(
                fb?.account_base_real_amount,
                fb?.account_base_plan_amount
              );
            }
          } else {
            d["account_level"] = 0;
            d[`${cities?.city_id}_plan_amount`] = codes?.code ? 0 : ``;
            d[`${cities?.city_id}_real_amount`] = codes?.code ? 0 : ``;
            d[`${cities?.city_id}_percentage`] = codes?.code ? 0 : ``;
          }
        });
        results?.data.push(d);
      });

      return results;
    } else if (report === "rekapitulasi") {
      results = { bases: [], cities: [], data: [] };

      // sorting
      let srt = _.sortBy(data, ["account_base_label", "city_label"]);

      // take all base
      results.bases = _.chain(srt)
        .groupBy("account_base_label")
        .map((values, label) => ({
          base: label,
          base_id: values[0].account_base_id,
          children: values,
        }))
        .value();

      // take all city
      results.cities = _.chain(srt)
        .groupBy("city_label")
        .map((values, label) => ({
          city: label,
          city_id: values[0].city_id,
          children: values,
        }))
        .value();

      // set data per-city
      _.map(results?.cities, (city, index) => {
        let d = { no: index + 1, label: city?.city };
        _.map(results.bases, (base) => {
          let fb = city?.children.find(
            (i) => i?.account_base_label === base?.base
          );

          if (fb) {
            d[`${base?.base_id}_plan_amount`] = formatterNumber(
              fb?.account_base_plan_amount
            );
            d[`${base?.base_id}_real_amount`] = formatterNumber(
              fb?.account_base_real_amount
            );
            d[`${base?.base_id}_percentage`] = sumPercentage(
              fb?.account_base_real_amount,
              fb?.account_base_plan_amount
            );
          } else {
            d[`${base?.base_id}_plan_amount`] = 0;
            d[`${base?.base_id}_real_amount`] = 0;
            d[`${base?.base_id}_percentage`] = 0;
          }
        });
        results?.data.push(d);
      });

      return results;
    }

    return results;
  };

  // recursive data for a while
  const recursiveRecord = (data, results = [], base = null, group = null) => {
    if (report === "kota") {
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
    } else if (report === "gabungankota") {
      _.map(data, (item) => {
        results.push(item);

        if (item?.children && !!item.children.length) {
          recursiveRecord(item?.children, results, item?.code, item?.code);
        }

        if (item?.code !== group && item?.code.split(".").length === 2) {
          group = item?.code;
          results.push(
            {
              level: 0,
              code: "",
              origin: item?.origin,
              label: `JUMLAH ${item?.label}`,
              plan_amount: item?.plan_amount,
              real_amount: item?.real_amount,
              percentage: item?.percentage,
            },
            {
              level: 0,
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

          results.push(
            {
              level: 0,
              code: "",
              label: `JUMLAH ${item?.label}`,
              origin: item?.origin,
              plan_amount: item?.plan_amount,
              real_amount: item?.real_amount,
              percentage: item?.percentage,
            },
            {
              level: 0,
              code: "",
              label: "",
              plan_amount: "",
              real_amount: "",
              percentage: "",
            }
          );

          if (item?.code === "5" || item?.code === 5) {
            results.push(
              {
                level: 0,
                code: "",
                label: `SURPLUS/DEFISIT`,
                origin: item?.origin,
                plan_amount: "",
                real_amount: "",
                percentage: 0,
              },
              {
                level: 0,
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
    }

    return results;
  };

  // normaling label account
  const normalizeLabel = (val) => {
    let _tf, _tl;

    _tf = val.split(" ")[0].replace(/[()]/g, "");
    _tl = val.split(" ");
    _tl.shift();

    return { code: _tf || "", label: _tl ? _tl.join(" ") : "" };
  };

  // percent
  const sumPercentage = (value1 = 0, value2 = 0, results = 0) => {
    if (isEmpty(value1)) value1 = 0;
    if (isEmpty(value2)) value2 = 0;

    results = parseFloat((value1 / value2) * 100).toFixed(0);

    if (isNaN(results) || !isFinite(Number(results))) return 0;

    return results;
  };

  // xlsx
  const xlsx = async (formValues = {}, _data = data) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(master ? `MASTER` : sheetTitle);
    const exportLog = {
      table: "",
      export: {
        detail: _data,
        fileName: fileName,
        type: "xlsx",
        sign: formValues,
      },
      mode: "E",
    };

    if (master) {
      // filename
      fileName = EXPORT_TARGET[master].filename;

      // header
      sheet.columns = EXPORT_TARGET[master].headers;

      // table export
      exportLog.table = master;
      exportLog.export.fileName = fileName;

      // data
      sheet.addRows(
        _data.map((item, index) => ({
          ...item,
          no: (index += 1),
          active: item?.active ? `Ya` : `Tidak`,
        })),
        "i"
      );
      sheet.eachRow((row, number) => {
        if (number === 1) {
          row.height = 50;
        }

        row.eachCell((cell) => {
          if (number === 1) {
            cell.style = {
              font: { bold: true },
            };
          } else {
            cell.style = {
              font: { bold: false },
            };
          }

          cell.style = {
            ...cell?.style,
            alignment: { vertical: "middle", horizontal: "center" },
            border: {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            },
          };
        });
      });
    }

    if (report) {
      if (report === "kota") {
        // set level from which prefer account
        if (!isEmpty(formValues?.account_level)) {
          exportLog.export.detail = _.filter(
            _data,
            (i) => i?.account_level <= formValues?.account_level
          );
        }

        const chooseCity = exportLog.export.detail[0].city_label || "";
        const chooseCityLogo = exportLog.export.detail[0].city_logo || "";

        // table export
        exportLog.table = "realisasi anggaran kota";

        // title
        const logoLeft = await axios.get(logoKemendagri, {
          responseType: "arraybuffer",
        });

        const logo1 = workbook.addImage({
          buffer: logoLeft.data,
          extension: "png",
        });

        sheet.addImage(logo1, {
          tl: { col: 0.35, row: 0.35 },
          ext: { width: 100, height: 120 },
          editAs: "absolute",
        });

        if (chooseCityLogo !== "") {
          const logoRight = await axiosInstance.get(
            `/app/logo/${chooseCityLogo}`,
            {
              responseType: "arraybuffer",
            }
          );

          const logo2 = workbook.addImage({
            buffer: logoRight.data,
            extension: "png",
          });

          sheet.addImage(logo2, {
            tl: { col: 4.35, row: 0.35 },
            ext: { width: 100, height: 120 },
            editAs: "absolute",
          });
        }

        sheet.mergeCells("A1", "A7");
        sheet.mergeCells("E1", "E7");
        sheet.mergeCells("B1", "D1");
        sheet.mergeCells("B2", "D2");
        sheet.mergeCells("B3", "D3");
        sheet.mergeCells("B4", "D4");
        sheet.mergeCells("B5", "D5");
        sheet.mergeCells("B6", "D6");
        sheet.mergeCells("B7", "D7");
        sheet.getCell("B2").value = upper(`Pemerintahan ${chooseCity}`);
        sheet.getCell("B2").style = {
          alignment: { vertical: "middle", horizontal: "center" },
          font: { bold: true },
        };
        sheet.getCell("B4").value =
          "LAPORAN REALISASI ANGGARAN PENDAPATAN DAN BELANJA DAERAH (KONSOLIDASI)";
        sheet.getCell("B4").style = {
          alignment: { vertical: "middle", horizontal: "center" },
          font: { bold: true },
        };
        sheet.getCell("B5").value = upper(
          `Tahun Anggaran ${viewDate(date[1]).split(" ").pop()}`
        );
        sheet.getCell("B5").style = {
          alignment: { vertical: "middle", horizontal: "center" },
          font: { bold: true },
        };
        sheet.getCell("B6").value = `${viewDate(date[0])} Sampai ${viewDate(
          date[1]
        )}`;
        sheet.getCell("B6").style = {
          alignment: { vertical: "middle", horizontal: "center" },
          font: { bold: true },
        };

        // header
        sheet.addRow([]);
        sheet.addRow([
          "KODE REKENING",
          "URAIAN",
          "ANGGARAN",
          "REALISASI",
          `% ${viewDate(date[1]).split(" ").pop()}`,
        ]);
        sheet.addRow(["1", "2", "3", "4", "5 = (4 / 3) * 100"]);
        sheet.addRow(["", "", "", "", ""]);
        sheet.columns = [
          { key: "code", width: 18 },
          { key: "label", width: 50 },
          { key: "plan_amount", width: 18 },
          { key: "real_amount", width: 18 },
          { key: "percentage", width: 18 },
        ];
        // return;
        // data
        sheet.addRows(exportLog.export.detail, "i");
        sheet.eachRow((row, number) => {
          if ([9, 10, 11].includes(number)) {
            if (number === 9) row.height = 50;

            row.eachCell((cell) => {
              cell.style = {
                alignment: { vertical: "middle", horizontal: "center" },
                font: { bold: true },
                border: {
                  top: { style: "thin" },
                  left: { style: "thin" },
                  bottom: { style: "thin" },
                  right: { style: "thin" },
                },
              };
            });
          } else if (number > 9) {
            row.eachCell((cell) => {
              const codeShell = sheet.getCell(`A${number}`);
              const countTick = codeShell.value.split(".").length;

              if (
                ["plan_amount", "real_amount", "percentage"].includes(
                  cell._column._key
                )
              ) {
                cell.style = {
                  font: { bold: countTick <= 2 },
                  alignment: {
                    horizontal: "right",
                    vertical: "middle",
                  },
                };
              } else {
                cell.style = {
                  font: { bold: countTick <= 2 },
                  alignment: {
                    horizontal: "left",
                    vertical: "middle",
                  },
                };
              }

              cell.style = {
                ...cell.style,
                border: {
                  top: { style: "thin" },
                  left: { style: "thin" },
                  bottom: { style: "thin" },
                  right: { style: "thin" },
                },
              };
            });
          }
        });
      } else if (report === "gabungankota") {
        // set level from which prefer account
        if (!isEmpty(formValues?.account_level)) {
          exportLog.export.detail["modified"] = _.filter(
            _data?.data,
            (c) => c?.account_level <= formValues?.account_level
          );
        } else {
          exportLog.export.detail["modified"] = _data?.data;
        }

        // table export
        exportLog.table = "realisasi anggaran gabungan kota";

        // header
        sheet.mergeCells("A8", "A9");
        sheet.mergeCells("B8", "B9");
        sheet.getCell("A8").value = `KODE REKENING`;
        sheet.getCell("A8").style = {
          alignment: { vertical: "middle", horizontal: "center" },
          font: { bold: true },
        };
        sheet.getCell("B8").value = `URAIAN`;
        sheet.getCell("B8").style = {
          alignment: { vertical: "middle", horizontal: "center" },
          font: { bold: true },
        };

        let sc = 3,
          sr = 8;
        let col = [
            { key: "code", width: 18 },
            { key: "label", width: 50 },
          ],
          scol = ["1", "2"];
        _.map(exportLog.export.detail.cities, (item) => {
          sheet.mergeCells(sr, sc, sr, sc + 2);

          const cr = sheet.getRow(sr);
          const crb = sheet.getRow(sr + 1);
          cr.getCell(sc).value = upper(item?.city);
          cr.getCell(sc).style = {
            alignment: { vertical: "middle", horizontal: "center" },
            font: { bold: true },
          };
          crb.height = 25;
          crb.getCell(sc).value = "ANGGARAN";
          crb.getCell(sc + 1).value = "REALISASI";
          crb.getCell(sc + 2).value = "%";
          crb.getCell(sc).style = {
            alignment: { vertical: "middle", horizontal: "center" },
            font: { bold: true },
          };
          crb.getCell(sc + 1).style = {
            alignment: { vertical: "middle", horizontal: "center" },
            font: { bold: true },
          };
          crb.getCell(sc + 2).style = {
            alignment: { vertical: "middle", horizontal: "center" },
            font: { bold: true },
          };
          col.push({ key: `${item?.city_id}_plan_amount`, width: 18 });
          col.push({ key: `${item?.city_id}_real_amount`, width: 18 });
          col.push({ key: `${item?.city_id}_percentage`, width: 18 });
          scol.push(`${sc}`);
          scol.push(`${sc + 1}`);
          scol.push(`${sc + 2} = (${sc + 1} / ${sc}) * 100`);

          sc += 3;
        });
        sheet.addRow(scol);
        sheet.addRow(_.fill(scol, ""));
        sheet.columns = col;

        // data
        sheet.addRows(exportLog.export.detail.modified, "i");
        sheet.eachRow((row, number) => {
          if ([8, 9, 10, 11].includes(number)) {
            row.eachCell((cell) => {
              cell.style = {
                alignment: { vertical: "middle", horizontal: "center" },
                font: { bold: true },
                border: {
                  top: { style: "thin" },
                  left: { style: "thin" },
                  bottom: { style: "thin" },
                  right: { style: "thin" },
                },
              };
            });
          } else if (number > 8) {
            row.eachCell((cell) => {
              const codeShell = sheet.getCell(`A${number}`);
              const countTick = codeShell.value.split(".").length;

              if (
                cell._column._key.includes("plan_amount") ||
                cell._column._key.includes("real_amount") ||
                cell._column._key.includes("percentage")
              ) {
                cell.style = {
                  font: { bold: countTick <= 2 },
                  alignment: {
                    horizontal: "right",
                    vertical: "middle",
                  },
                };
              } else {
                cell.style = {
                  font: { bold: countTick <= 2 },
                  alignment: {
                    horizontal: "left",
                    vertical: "middle",
                  },
                };
              }

              cell.style = {
                ...cell.style,
                border: {
                  top: { style: "thin" },
                  left: { style: "thin" },
                  bottom: { style: "thin" },
                  right: { style: "thin" },
                },
              };
            });
          }
        });

        // title
        let firstrow = sheet.getRow(8);
        let firstcell = firstrow._cells[0];
        let lastcell = firstrow._cells[firstrow._cells.length - 1];
        let firstchellchar = firstcell._address.charAt(0);
        let lastchellchar = lastcell._address.charAt(0);

        for (let pos = 1; pos <= 7; pos++) {
          sheet.mergeCells(`${firstchellchar}${pos}`, `${lastchellchar}${pos}`);

          if (pos === 3) {
            sheet.getCell(`${firstchellchar}${pos}`).value =
              "LAPORAN REALISASI ANGGARAN PENDAPATAN DAN BELANJA DAERAH (KONSOLIDASI)";
            sheet.getCell(`${firstchellchar}${pos}`).style = {
              alignment: { vertical: "middle", horizontal: "center" },
              font: { bold: true },
            };
          } else if (pos === 4) {
            sheet.getCell(
              `${firstchellchar}${pos}`
            ).value = `KABUPATEN/KOTA SE-PROVINSI KEPULAUAN RIAU ANGGARAN ${viewDate(
              date[1]
            )}`;
            sheet.getCell(`${firstchellchar}${pos}`).style = {
              alignment: { vertical: "middle", horizontal: "center" },
              font: { bold: true },
            };
          } else if (pos === 5) {
            sheet.getCell(`${firstchellchar}${pos}`).value = upper(
              `${viewDate(date[0])} Sampai ${viewDate(date[1])}`
            );
            sheet.getCell(`${firstchellchar}${pos}`).style = {
              alignment: { vertical: "middle", horizontal: "center" },
              font: { bold: true },
            };
          }
        }
      } else if (report === "rekapitulasi") {
        // table export
        exportLog.table = "rekapitulasi pendapatan dan belanja";
        // header
        sheet.mergeCells("A8", "A10");
        sheet.mergeCells("B8", "B10");
        sheet.getCell("A8").value = `NO`;
        sheet.getCell("A8").style = {
          alignment: { vertical: "middle", horizontal: "center" },
          font: { bold: true },
        };
        sheet.getCell("B8").value = `KABUPATEN / KOTA`;
        sheet.getCell("B8").style = {
          alignment: { vertical: "middle", horizontal: "center" },
          font: { bold: true },
        };

        let colBase = 3,
          rowBase = 8;
        let col = [
          { key: "no", width: 7 },
          { key: "label", width: 35 },
        ];

        _.map(_data?.bases, (base) => {
          sheet.mergeCells(rowBase, colBase, rowBase, colBase + 1);

          const rowBase1 = sheet.getRow(rowBase);
          const rowBase2 = sheet.getRow(rowBase + 1);
          const rowBase3 = sheet.getRow(rowBase + 2);
          // akun base label
          rowBase1.getCell(colBase).value = upper(base?.base);
          // target
          rowBase2.getCell(colBase).value = "TARGET";
          // realisasi
          rowBase2.getCell(colBase + 1).value = "REALISASI";
          // Rp
          rowBase3.getCell(colBase).value = "(Rp)";
          // Rp
          rowBase3.getCell(colBase + 1).value = "(Rp)";
          // %
          sheet.mergeCells(rowBase, colBase + 2, rowBase + 2, colBase + 2);
          rowBase1.getCell(colBase + 2).value = "%";

          col.push({ key: `${base?.base_id}_plan_amount`, width: 22 });
          col.push({ key: `${base?.base_id}_real_amount`, width: 22 });
          col.push({ key: `${base?.base_id}_percentage`, width: 12 });

          colBase += 3;
        });
        sheet.columns = col;

        // data
        sheet.addRows(_data?.data, "i");
        sheet.eachRow((row, number) => {
          if ([8, 9, 10].includes(number)) {
            row.eachCell((cell) => {
              cell.style = {
                alignment: { vertical: "middle", horizontal: "center" },
                font: { bold: true },
                border: {
                  top: { style: "thin" },
                  left: { style: "thin" },
                  bottom: { style: "thin" },
                  right: { style: "thin" },
                },
              };
            });
          } else if (number > 8) {
            row.eachCell((cell) => {
              if (
                cell._column._key === "no" ||
                cell._column._key.includes("percentage")
              ) {
                cell.style = {
                  alignment: {
                    horizontal: "center",
                    vertical: "middle",
                  },
                };
              } else if (
                cell._column._key.includes("plan_amount") ||
                cell._column._key.includes("real_amount")
              ) {
                cell.style = {
                  alignment: {
                    horizontal: "right",
                    vertical: "middle",
                  },
                };
              }

              cell.style = {
                ...cell.style,
                border: {
                  top: { style: "thin" },
                  left: { style: "thin" },
                  bottom: { style: "thin" },
                  right: { style: "thin" },
                },
              };
            });
          }
        });

        // total
        const totalRow = sheet.lastRow;
        let total = ["TOTAL", ""];

        _.map(_data?.bases, (base) => {
          let tpa = 0,
            tra = 0,
            tp = 0;

          tpa = _.sumBy(base?.children, (item) =>
            Number(item?.account_base_plan_amount)
          );
          tra = _.sumBy(base?.children, (item) =>
            Number(item?.account_base_real_amount)
          );
          tp = ((tra / tpa) * 100).toFixed(2);

          total.push(formatterNumber(tpa));
          total.push(formatterNumber(tra));
          total.push(tp);
        });
        sheet.addRow(total);
        sheet.getRow(totalRow.number + 1).eachCell((cell) => {
          let cellno = cell._column._number;
          let cellkey = cell._column._key;

          if (cellno === 2) {
            sheet.mergeCells(
              `A${totalRow?.number + 1}`,
              `B${totalRow?.number + 1}`
            );
            sheet.getCell(`A${totalRow?.number + 1}`).style = {
              alignment: {
                horizontal: "center",
                vertical: "middle",
              },
              font: { bold: true },
              border: {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
              },
            };
            sheet.getCell(`B${totalRow?.number + 1}`).style = {
              alignment: {
                horizontal: "center",
                vertical: "middle",
              },
              font: { bold: true },
              border: {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
              },
            };
          } else if (cellno > 2) {
            if (cellkey.includes("percentage")) {
              cell.style = {
                alignment: {
                  horizontal: "center",
                  vertical: "middle",
                },
              };
            } else if (
              cellkey.includes("plan_amount") ||
              cellkey.includes("real_amount")
            ) {
              cell.style = {
                alignment: {
                  horizontal: "right",
                  vertical: "middle",
                },
              };
            }

            cell.style = {
              ...cell.style,
              font: { bold: true },
              border: {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
              },
            };
          }
        });

        // title
        let firstrow = sheet.getRow(8);
        let firstcell = firstrow._cells[0];
        let lastcell = firstrow._cells[firstrow._cells.length - 1];
        let firstchellchar = firstcell._address.charAt(0);
        let lastchellchar = lastcell._address.charAt(0);

        for (let pos = 1; pos <= 7; pos++) {
          sheet.mergeCells(`${firstchellchar}${pos}`, `${lastchellchar}${pos}`);

          if (pos === 3) {
            sheet.getCell(`${firstchellchar}${pos}`).value =
              "REKAPITULASI PENDAPATAN DAN BELANJA";
            sheet.getCell(`${firstchellchar}${pos}`).style = {
              alignment: { vertical: "middle", horizontal: "center" },
              font: { bold: true },
            };
          } else if (pos === 4) {
            sheet.getCell(
              `${firstchellchar}${pos}`
            ).value = `APBD KABUPATEN / KOTA SE-PROVINSI KEPULAUAN RIAU TAHUN ANGGARAN ${convertDate(
              date[0],
              "YYYY"
            )}`;
            sheet.getCell(`${firstchellchar}${pos}`).style = {
              alignment: { vertical: "middle", horizontal: "center" },
              font: { bold: true },
            };
          } else if (pos === 5) {
            sheet.getCell(`${firstchellchar}${pos}`).value = `PER ${upper(
              viewDate(date[1])
            )}`;
            sheet.getCell(`${firstchellchar}${pos}`).style = {
              alignment: { vertical: "middle", horizontal: "center" },
              font: { bold: true },
            };
          }
        }
      }

      // make know and signer
      const last = sheet.lastRow;

      if (last && !!signers.length) {
        // know part
        const knowIs = signers.find((d) => d?.id === formValues?.know_id);

        if (knowIs) {
          let initKnow = (last.number || 0) + 4;

          sheet.getCell(`B${initKnow}`).value = "Menyetujui,";
          sheet.getCell(`B${initKnow + 1}`).value = knowIs?.position;
          sheet.getCell(`B${initKnow + 5}`).value = knowIs?.label;
          sheet.getCell(`B${initKnow + 6}`).value = knowIs?.title;
          sheet.getCell(`B${initKnow + 7}`).value = `NIP. ${knowIs?.nip}`;
        }

        // signer part
        const signerIs = signers.find((d) => d?.id === formValues?.signer_id);

        if (signerIs) {
          let initSigner = (last.number || 0) + 3;
          let firstSignerCell = last._cells[last._cells.length - 3];
          let lastSignerCell = last._cells[last._cells.length - 1];
          let initSignerCellChar = firstSignerCell._address.charAt(0);
          let lastSignerCellChar = lastSignerCell._address.charAt(0);

          sheet.mergeCells(
            initSignerCellChar + initSigner,
            lastSignerCellChar + initSigner
          );
          sheet.getCell(
            initSignerCellChar + initSigner
          ).value = `_________________, ${viewDate(formValues?.export_date)}`;

          sheet.mergeCells(
            initSignerCellChar + (initSigner + 1),
            lastSignerCellChar + (initSigner + 1)
          );
          sheet.getCell(initSignerCellChar + (initSigner + 1)).value =
            "Dibuat oleh,";

          sheet.mergeCells(
            initSignerCellChar + (initSigner + 2),
            lastSignerCellChar + (initSigner + 2)
          );
          sheet.getCell(initSignerCellChar + (initSigner + 2)).value =
            signerIs?.position;

          sheet.mergeCells(
            initSignerCellChar + (initSigner + 6),
            lastSignerCellChar + (initSigner + 6)
          );
          sheet.getCell(initSignerCellChar + (initSigner + 6)).value =
            signerIs?.label;

          sheet.mergeCells(
            initSignerCellChar + (initSigner + 7),
            lastSignerCellChar + (initSigner + 7)
          );
          sheet.getCell(initSignerCellChar + (initSigner + 7)).value =
            signerIs?.title;

          sheet.mergeCells(
            initSignerCellChar + (initSigner + 8),
            lastSignerCellChar + (initSigner + 8)
          );
          sheet.getCell(
            initSignerCellChar + (initSigner + 8)
          ).value = `NIP. ${signerIs?.nip}`;
        }
      }
    }

    addExportLog(exportLog).then((response) => {
      setLoadingPdf(false);
      setLoading(false);

      if (response?.code === 200) {
        workbook.xlsx.writeBuffer().then(function (_data) {
          const blob = new Blob([_data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement("a");

          anchor.href = url;
          anchor.download = `${upper(fileName)}-${dbDate(convertDate())}.xlsx`;
          anchor.click();
          window.URL.revokeObjectURL(url);

          onSignerModal(false);
        });
      }
    });
  };

  // pdf
  const pdfx = async (formValues = {}, _data = data) => {
    const dataSigner = {
      export_date: viewDate(formValues?.export_date),
      signerIs: signers.find((d) => d?.id === formValues?.signer_id),
      knowIs: signers.find((d) => d?.id === formValues?.know_id),
    };

    const exportLog = {
      table: master ?? report,
      export: {
        detail: _data,
        fileName: `${master ? EXPORT_TARGET[master].filename : fileName}`,
        type: "pdf",
        sign: formValues,
      },
      mode: "E",
    };

    // set level from which prefer account
    if (!isEmpty(formValues?.account_level)) {
      exportLog.export.detail = _.filter(
        _data,
        (i) => i?.account_level <= formValues?.account_level
      );
    }

    const doc = (
      <PDFFile
        master={master}
        report={report}
        data={exportLog.export.detail}
        date={date}
        orientation={pdfOrientation}
        signer={dataSigner}
      />
    );
    const asPdf = pdf([]); // {} or [] is important, throws without an argument
    asPdf.updateContainer(doc);

    addExportLog(exportLog).then(async (response) => {
      setLoadingPdf(false);
      setLoading(false);
      onSignerModal(false);

      if (response?.code === 200) {
        const blob = await asPdf.toBlob();
        saveAs(
          blob,
          `${master ? EXPORT_TARGET[master].filename : fileName}-${dbDate(
            convertDate()
          )}.pdf`
        );
      }
    });
  };

  // either of admin see this modal
  const onAccountModal = (show) => {
    setAccountModal(show);

    if (show) form.resetFields();
  };

  // only admin see this modal
  const onSignerModal = (show) => {
    setSignerModal(show);

    if (show) form.resetFields();
  };

  useEffect(() => {
    if (!master) {
      setLoading(true);
      getSignerList().then((response) => {
        setLoading(false);
        setSigners(response?.data);
      });
    }
  }, []);

  return (
    <>
      <Dropdown
        menu={{
          items: _.map(
            [
              {
                key: "xlsx",
                label: ".XLSX",
                onClick: () => {
                  if (is_super_admin && report) {
                    onSignerModal(true);
                    setDoNext("xlsx");
                  } else if (report) {
                    onAccountModal(true);
                    setDoNext("xlsx");
                  } else {
                    xlsx();
                  }
                },
              },
              {
                key: "pdf",
                label: ".PDF",
                onClick: () => {
                  if (is_super_admin && report) {
                    onSignerModal(true);
                    setDoNext("pdfx");
                  } else if (report) {
                    onAccountModal(true);
                    setDoNext("pdfx");
                  } else {
                    pdfx();
                  }
                },
              },
            ],
            (data) => {
              if (types.includes(data?.key)) return data;
            }
          ),
        }}
        trigger={["click"]}
      >
        <Button type="primary" icon={<ExportOutlined />}>
          <Space>
            Ekspor
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>
      <Modal
        style={{ margin: 10 }}
        centered
        open={signerModal}
        title={`Ekspor Data`}
        onCancel={() => onSignerModal(false)}
        footer={null}
      >
        <Form
          form={form}
          labelCol={{ span: 8 }}
          labelAlign="left"
          onFinish={(v) => collect(v)}
          autoComplete="off"
          initialValues={{
            signer_id: "",
            know_id: "",
            export_date: convertDate(),
            account_level: "",
          }}
        >
          <Divider orientation="left" plain>
            Format Kiri
          </Divider>
          <Form.Item
            label="Mengetahui"
            name="know_id"
            rules={[
              {
                required: true,
                message: "Mengetahui tidak boleh kosong!",
              },
            ]}
          >
            <Select
              disabled={loadingPdf}
              loading={loading}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (lower(option?.children) ?? "").includes(lower(input))
              }
            >
              {signers &&
                !!signers.length &&
                _.map(signers, (item) => (
                  <Select.Option key={String(item?.id)} value={item?.id}>
                    {`NIP. ${item?.nip} ${item?.label}`}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Divider orientation="left" plain>
            Format Kanan
          </Divider>
          <Form.Item
            label="Tanggal"
            name="export_date"
            rules={[
              {
                required: true,
                message: "Tanggal tidak boleh kosong!",
              },
            ]}
          >
            <DatePicker format={DATE_FORMAT_VIEW} className="w-full" />
          </Form.Item>
          <Form.Item
            label="Penanda Tangan"
            name="signer_id"
            rules={[
              {
                required: true,
                message: "Penanda Tangan tidak boleh kosong!",
              },
            ]}
          >
            <Select
              allowClear
              showSearch
              disabled={loadingPdf}
              loading={loading}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (lower(option?.children) ?? "").includes(lower(input))
              }
            >
              {signers &&
                !!signers.length &&
                _.map(signers, (item) => (
                  <Select.Option key={String(item?.id)} value={item?.id}>
                    {`NIP. ${item?.nip} ${item?.label}`}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Rekening"
            name="account_level"
            hidden={report === "rekapitulasi"}
            rules={[
              {
                required: report !== "rekapitulasi",
                message: "Rekening tidak boleh kosong!",
              },
            ]}
          >
            <Select
              disabled={loadingPdf}
              loading={loading}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (lower(option?.children) ?? "").includes(lower(input))
              }
            >
              {_.map(account_level, (item) => (
                <Select.Option key={String(item?.id)} value={item?.id}>
                  {item?.value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Divider />
          <Form.Item className="text-right mb-0">
            <Space direction="horizontal">
              <Button
                disabled={loadingPdf}
                onClick={() => onSignerModal(false)}
              >
                Kembali
              </Button>
              <Button loading={loadingPdf} htmlType="submit" type="primary">
                Simpan
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        style={{ margin: 10 }}
        centered
        open={accountModal}
        title={`Ekspor Data`}
        onCancel={() => onAccountModal(false)}
        footer={null}
      >
        <Form
          form={form}
          labelCol={{ span: 8 }}
          labelAlign="left"
          onFinish={
            (v) => collect(v)
            // doNext === "xlsx" ? xlsx(v) : doNext === "pdfx" ? pdfx(v) : null
          }
          autoComplete="off"
          initialValues={{
            account_level: "",
          }}
        >
          <Divider />
          <Form.Item
            label="Rekening"
            name="account_level"
            rules={[
              {
                required: true,
                message: "Rekening tidak boleh kosong!",
              },
            ]}
          >
            <Select
              disabled={loadingPdf}
              loading={loading}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (lower(option?.children) ?? "").includes(lower(input))
              }
            >
              {_.map(account_level, (item) => (
                <Select.Option key={String(item?.id)} value={item?.id}>
                  {item?.value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Divider />
          <Form.Item className="text-right mb-0">
            <Space direction="horizontal">
              <Button
                disabled={loadingPdf}
                onClick={() => onAccountModal(false)}
              >
                Kembali
              </Button>
              <Button loading={loadingPdf} htmlType="submit" type="primary">
                Simpan
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
