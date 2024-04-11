import { useEffect, useMemo, useState } from "react";
import HeaderComponent from "./Header";
import {
  Breadcrumb,
  Button,
  Divider,
  Drawer,
  Form,
  Layout,
  Modal,
  Menu,
  Select,
  Space,
} from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Copyright from "./Copyright";
import {
  COLORS,
  CUSTOM_ROUTE_ACCOUNT,
  MENU_ITEM,
  MENU_NAVIGATION,
} from "../helpers/constants";
import useRole from "../hooks/useRole";
import { CloseOutlined } from "@ant-design/icons";
import _ from "lodash";
import { isEmpty, lower } from "../helpers/typo";
import { getTemplate } from "../services/real";

const ExcelJS = require("exceljs");

const { Content, Footer, Sider } = Layout;

const initLink = [
  {
    title: (
      <Link to="/" style={{ color: COLORS.main }}>
        Beranda
      </Link>
    ),
    key: "/beranda",
  },
];

export default function Wrapper({ children }) {
  const { role_id } = useRole();
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);
  const [currentMenu, setCurrentMenu] = useState([]);
  const [navLink, setNavLink] = useState(initLink);
  const navigate = useNavigate();

  const [dowloadTemplateModal, setDowloadTemplateModal] = useState(false);
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);

  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);

    if (MENU_ITEM.map(({ key }) => key).indexOf(latestOpenKey) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  const onMenuClick = (current) => {
    // menu modal
    if (current?.key === "/realisasi/download-template") {
      handleDownloadModal(true);
    } else {
      // trigger from location react router
      if (current?.pathname) {
        let spl = current?.pathname.split("/");

        if (_.size(spl) === 3) {
          // for level 1
          onOpenChange([`/${spl[1]}`]);
        } else if (_.size(spl) === 4) {
          // for level 2
          onOpenChange([`/${spl[1]}`, `/${spl[2]}`]);
        } else {
          onOpenChange([]);
        }

        if (current?.pathname.includes("rekening")) {
          setCurrentMenu(`/${spl[1]}`);
        } else if (current?.pathname.includes("transaksi")) {
          setCurrentMenu(`/${spl[1]}`);
          setCurrentMenu(`/${spl[2]}`);
          setCurrentMenu(`/${spl[2]}/${spl[3]}`);
        } else {
          setCurrentMenu(current?.pathname);
        }
      }
      // trigger from on click menu
      else {
        setCurrentMenu(current?.keyPath);
      }
    }
  };

  const handleDownloadModal = (show) => {
    setDowloadTemplateModal(show);

    if (show) {
      form.resetFields();
    }
  };

  const onOkDowload = (values) => {
    setConfirmLoading(true);
    getTemplate(values?.template_type).then((response) => {
      if (response?.code === 200) {
        // make excel
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("REALISASI");

        sheet.columns = [
          { header: "Nomor Rekening", key: "code", width: 20 },
          { header: "Name Rekening", key: "name", width: 120 },
          { header: "Pagu", key: "budget_amount", width: 15 },
          { header: "Realisasi", key: "realization_amount", width: 15 },
          { header: "Tanggal Realisasi", key: "realization_date", width: 15 },
        ];

        sheet.addRows(response?.data);

        workbook.xlsx.writeBuffer().then(function (data) {
          const blob = new Blob([data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement("a");

          anchor.href = url;
          anchor.download = `REALISASI_TEMPLATE.xlsx`;
          anchor.click();
          window.URL.revokeObjectURL(url);

          setConfirmLoading(false);
          handleDownloadModal(false);
        });
      } else {
        setConfirmLoading(false);
      }
    });
  };

  const showDrawer = () => {
    setDrawer(true);
  };

  const onClose = () => {
    setDrawer(false);
  };

  const navigating = (route) => {
    if (drawer) {
      setDrawer(false);
    }

    navigate(route);
  };

  const createMenu = useMemo(() => {
    // find all access menu
    const menus = _.map(
      _.filter(MENU_ITEM, (i) => i.roles.includes(role_id)),
      (menu) => {
        // currently until 2 level
        // check children
        if (!isEmpty(menu?.children) && !!menu?.children.length) {
          // filter access level 1
          menu = {
            ...menu,
            children: _.filter(menu?.children, (lvl1) =>
              lvl1.roles.includes(role_id)
            ),
          };

          menu = {
            ...menu,
            children: _.map(menu?.children, (lvl1) => {
              // check children
              if (!isEmpty(lvl1?.children) && !!lvl1?.children.length) {
                // filter access level 2
                lvl1.children = _.filter(lvl1.children, (lvl2) =>
                  lvl2.roles.includes(role_id)
                );

                lvl1.children = _.map(lvl1.children, (lvl2) => {
                  // add button click on menu if have navigation
                  if (!isEmpty(lvl2?.nav)) {
                    lvl2 = { ...lvl2, onClick: () => navigating(lvl2?.nav) };
                  }

                  return lvl2;
                });
              }

              if (!isEmpty(lvl1?.nav)) {
                // add button click on menu if have navigation
                lvl1 = {
                  ...lvl1,
                  onClick: () => navigating(lvl1?.nav),
                };
              }

              return lvl1;
            }),
          };
        }

        // add button click on menu if have navigation
        if (!isEmpty(menu?.nav)) {
          menu = { ...menu, onClick: () => navigating(menu?.nav) };
        }

        return menu;
      }
    );

    return menus;
  }, [role_id]);

  useEffect(() => {
    onMenuClick(location);

    const pathSnippets = location.pathname.split("/").filter((i) => i);
    const sizeSnippets = _.size(pathSnippets);

    if (sizeSnippets) {
      if (pathSnippets[0] === "rekening") {
        const _menu = [].concat(navLink);
        const _route = pathSnippets[1] || pathSnippets[0];
        const _path = CUSTOM_ROUTE_ACCOUNT[_route];

        if (!isEmpty(_route) && !isEmpty(_path)) {
          _.remove(_menu, (__, i) => i > _.size(_path) - 1);

          // for navigate from any menu, remove index after `/beranda`
          if (!isEmpty(_menu[1]?.key) && _menu[1]?.key !== "/rekening") {
            _.remove(_menu, (__, i) => i === 1);
          }

          _.map(_path, (p, i) => {
            const _pe = _.find(_menu, (o) => o?.key === `/${p}`);
            const _le = _.find(_menu, (o) => o?.key === location.pathname);

            if (i <= 1 && isEmpty(_pe)) {
              _menu.push({
                key: `/${p}`,
                title: (
                  <Link to={`/${p}`} style={{ color: COLORS.main }}>
                    {MENU_NAVIGATION[p]}
                  </Link>
                ),
              });
            } else if (i > 1 && isEmpty(_le)) {
              _menu.push({
                key: location.pathname,
                title: (
                  <Link to={location.pathname} style={{ color: COLORS.main }}>
                    {MENU_NAVIGATION[_route]}
                  </Link>
                ),
              });
            }
          });
        }

        setNavLink(_menu);
      } else {
        _.map(pathSnippets, (_, index) => {
          const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;

          if (MENU_NAVIGATION[url]) {
            setNavLink([
              ...initLink,
              {
                key: url,
                title: (
                  <Link to={url} style={{ color: COLORS.main }}>
                    {MENU_NAVIGATION[url]}
                  </Link>
                ),
              },
            ]);
          }
        });
      }
    } else {
      setNavLink(initLink);
    }
  }, [location]);

  return (
    <Layout>
      <Sider
        style={{
          overflow: "auto",
          height: "100vh",
          position: "sticky",
          top: 0,
          left: 0,
        }}
        theme="light"
        width={280}
        trigger={null}
        className="hidden lg:grid"
      >
        <div className="h-8 m-4 text-center">
          <h2 className="text-white tracking-wider">
            {process.env.REACT_APP_NAME}
          </h2>
        </div>
        <Menu
          mode="inline"
          className="font-medium menu-wide"
          selectedKeys={currentMenu}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          onClick={onMenuClick}
          items={createMenu}
        />
      </Sider>
      <Drawer
        title={<span className="text-white">{process.env.REACT_APP_NAME}</span>}
        closeIcon={<CloseOutlined style={{ color: COLORS.white }} />}
        placement={`left`}
        onClose={onClose}
        open={drawer}
        width={300}
        headerStyle={{ backgroundColor: COLORS.main }}
        bodyStyle={{ padding: 0, backgroundColor: COLORS.main }}
      >
        <Menu
          mode="inline"
          className="font-medium menu-wide"
          selectedKeys={currentMenu}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          onClick={onMenuClick}
          items={createMenu}
        />
      </Drawer>
      <Layout>
        <HeaderComponent onDrawer={() => showDrawer()} />
        <Breadcrumb items={navLink} className="px-4 pt-3" />
        <Content className="p-2.5 m-2.5 bg-white min-h-fit rounded-md shadow-sm">
          {children}
        </Content>
        <Footer className="text-center m-0 p-4">
          <Copyright />
        </Footer>
      </Layout>

      <Modal
        style={{ margin: 10 }}
        centered
        open={dowloadTemplateModal}
        title={`Download Template`}
        onCancel={() => handleDownloadModal(false)}
        closable={false}
        footer={null}
      >
        <Form
          form={form}
          labelCol={{ span: 8 }}
          labelAlign="left"
          onFinish={onOkDowload}
          autoComplete="off"
          initialValues={{ template_type: "" }}
        >
          <Form.Item
            label="Realisasi"
            name="template_type"
            rules={[
              {
                required: true,
                message: "Realisasi tidak boleh kosong!",
              },
            ]}
          >
            <Select
              disabled={confirmLoading}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (lower(option?.children) ?? "").includes(lower(input))
              }
            >
              <Select.Option value="in">Ralisasi Pendapatan</Select.Option>
              <Select.Option value="out">Ralisasi Belanja</Select.Option>
              <Select.Option value="cost">Ralisasi Pembiayaan</Select.Option>
            </Select>
          </Form.Item>
          <Divider />
          <Form.Item className="text-right mb-0">
            <Space direction="horizontal">
              <Button
                disabled={confirmLoading}
                onClick={() => handleDownloadModal(false)}
              >
                Kembali
              </Button>
              <Button loading={confirmLoading} htmlType="submit" type="primary">
                Download
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
