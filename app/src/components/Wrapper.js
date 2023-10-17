import { useEffect, useMemo, useState } from "react";
import { Breadcrumb, Drawer, Layout, Menu } from "antd";
import HeaderComponent from "./Header";
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
import { isEmpty } from "../helpers/typo";

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

  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);

    if (MENU_ITEM.map(({ key }) => key).indexOf(latestOpenKey) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  const onMenuClick = (current) => {
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
    </Layout>
  );
}
