"use client";
import { GithubFilled, LogoutOutlined } from "@ant-design/icons";
import { ProLayout } from "@ant-design/pro-components";
import { Dropdown, message } from "antd";
import React from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import GlobalFooter from "@/components/GlobalFooter";
import { menus } from "../../../config/menu";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/stores";
import getAccessibleMenus from "@/access/menuAccess";
import { userLogoutUsingPost } from "@/api/userController";
import { setLoginUser } from "@/stores/loginUser";
import { DEFAULT_USER } from "@/constants/user";
import SearchInput from "@/layouts/BasicLayout/components/SearchInput";
import "./index.css";

interface Props {
  children: React.ReactNode;
}

/**
 * 全局通用布局
 * @param children
 * @constructor
 */
export default function BasicLayout({ children }: Props) {
  const pathname = usePathname();
  // 当前登录用户
  const loginUser = useSelector((state: RootState) => state.loginUser);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  /**
   * 用户注销
   */
  const userLogout = async () => {
    try {
      await userLogoutUsingPost();
      message.success("已退出登录");
      dispatch(setLoginUser(DEFAULT_USER));
      router.push("/user/login");
    } catch (e) {
      message.error("操作失败，" + e.message);
    }
  };

  return (
    //  结尾下面空的高度
    <div
      id="basicLayout"
      style={{
        height: "100vh",
        overflow: "auto",
      }}
    >
      <ProLayout

        title="用户管理平台"
        layout="top"
        logo={
          <Image
            src="/assets/favicon.ico"
            height={32}
            width={32}
            alt="用户管理平台 - 蓝花晨月夕"
          />
        }// 在 <Image> 组件中，alt 属性用于提供图像的替代文本。

          // 路由组件
        location={{
          pathname,
        }}

        // {/* 头像组件 */}
        avatarProps={{
          src: loginUser.userAvatar || "/assets/favicon.ico",
          size: "small",
          title: loginUser.userName || "蓝花晨月夕",
          render: (props, dom) => {
            if (!loginUser.id) {
              return (
                <div
                  onClick={() => {
                    router.push("/user/login");
                  }}
                >
                  {dom}
                </div>
              );
            }
            return (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "logout",
                      icon: <LogoutOutlined />,
                      label: "退出登录",
                    },
                  ],
                  onClick: async (event: { key: React.Key }) => {
                    const { key } = event;
                    if (key === "logout") {
                      userLogout();
                    }
                  },
                }}
              >
                {dom}
              </Dropdown>
            );
          },
        }}

        // {/*渲染右上角按钮，如果是移动设备，不显示操作按钮；否则显示搜索输入框和 GitHub 链接*/}
        actionsRender={(props) => {
          if (props.isMobile) return [];
          return [
            <SearchInput key="search" />,
            <a
              key="github"
              href="https://github.com/jhaugus"
              target="_blank"
            >
              {/*github图标*/}
              <GithubFilled key="GithubFilled" />

            </a>,
          ];
        }}
        // 自定义头部标题的渲染、返回一个logo和标题的连接
        headerTitleRender={(logo, title, _) => {
          return (
            <a>
              {logo}
              {title}
            </a>
          );
        }}


        // 渲染底部栏
        footerRender={() => {
          return <GlobalFooter />;
        }}
        onMenuHeaderClick={(e) => console.log(e)}




        // 定义有哪些菜单 主页 题库 题目 面试鸭
        menuDataRender={() => {
          return getAccessibleMenus(loginUser, menus);
        }}
        // 定义了菜单项如何渲染 点击跳转
        menuItemRender={(item, dom) => (
          <Link href={item.path || "/"} target={item.target}>
            {dom}
          </Link>
        )}
      >
        {children}
      </ProLayout>
    </div>
  );
}
