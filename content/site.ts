import type { SiteContent } from "@/types/content";

import {
  branchNetworkHref,
  contactEmailHref,
  dgoAcademyHref,
  expertTalkPlaylistHref,
  facebookHref,
  hotlineHref,
  openAccountHref,
  youtubeHref,
} from "./links";

// NEXT_PUBLIC_* được nhúng lúc build — đặt lúc chạy không có tác dụng.
const defaultSiteUrl = process.env.NODE_ENV === "production" ? "https://dautu.vndirect.com.vn" : "http://localhost:3000";
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? defaultSiteUrl).replace(/\/$/, "");

export const siteContent = {
  name: "VNDIRECT",
  url: siteUrl,
  locale: "vi_VN",
  language: "vi",
  description: "Nếp và cộng đồng đầu tư bền vững trọn đời, xây ngôi nhà đầu tư cùng VNDIRECT.",
  keywords: ["VNDIRECT", "Nếp sống đầu tư", "đầu tư bền vững", "tích sản", "quỹ đầu tư", "trái phiếu"],
  defaultOgImage: {
    url: "/images/og-default.jpg",
    alt: "Nếp sống đầu tư cùng VNDIRECT",
    width: 1200,
    height: 630,
  },
  iconPath: "/icon.svg",
  skipLinkLabel: "Chuyển đến nội dung chính",
  organization: {
    legalName: "Công ty Cổ phần Chứng khoán VNDIRECT",
    logoPath: "/brand/logo.svg",
    email: "daututaichinh@vndirect.com.vn",
    telephone: "1900 545 409",
    sameAs: [facebookHref, youtubeHref],
  },
  header: {
    logoSrc: "/brand/vndirect-logo.svg",
    logoOnLightSrc: "/brand/vndirect-logo-color.svg",
    logoAlt: "VNDIRECT",
    homeLabel: "Nếp sống đầu tư VNDIRECT — Trang chủ",
    navLabel: "Điều hướng chính",
    menuOpenLabel: "Mở menu",
    menuCloseLabel: "Đóng menu",
    nav: [
      { label: "La bàn đầu tư", href: "/dgo/" },
      {
        label: "Tài chính an sinh",
        menu: {
          groups: [
            {
              title: "Tài chính an sinh",
              href: "/dlife/",
              links: [
                {
                  label: "Đầu tư thu nhập ổn định",
                  href: "/dlife/",
                  children: [
                    { label: "DBOND – Danh mục trái phiếu kỳ hạn ngắn", href: "/trai-phieu-d-bond/" },
                    { label: "Quỹ đầu tư trái phiếu VNDBF", href: "/san-pham/quy-dau-tu-trai-phieu-vnd-vndbf-doanh-nghiep/" },
                    { label: "Quỹ Đầu tư Trái phiếu Linh hoạt VNDCF", href: "/quy-dau-tu-trai-phieu-linh-hoat-vndcf/" },
                  ],
                },
                { label: "Tiết kiệm hưu trí", href: "/san-pham/tich-san-huu-tri/" },
                { label: "Tích sản mục tiêu", href: "/san-pham/tich-san-muc-tieu/" },
              ],
            },
          ],
        },
      },
      {
        label: "Sản phẩm đầu tư",
        menu: {
          groups: [
            {
              title: "Danh mục đầu tư",
              links: [{ label: "ETF IPAAM VN100", href: "/quy-etf-ipaam-vn100/" }],
            },
            {
              title: "Chứng chỉ quỹ",
              links: [
                { label: "Quỹ đầu tư chủ động – Quỹ mở VNDAF", href: "/san-pham/chung-chi-quy-mo-vndaf/" },
                { label: "Quỹ đầu tư trái phiếu VND – VNDBF", href: "/san-pham/quy-dau-tu-trai-phieu-vnd-vndbf/" },
                { label: "Quỹ đầu tư trái phiếu linh hoạt VNDCF", href: "/quy-dau-tu-trai-phieu-linh-hoat-vndcf/" },
              ],
            },
            {
              title: "Trái phiếu doanh nghiệp",
              links: [
                { label: "Trái phiếu D-Bond", href: "/trai-phieu-d-bond/" },
                { label: "Trái phiếu V-Bond", href: "/trai-phieu-v-bond/" },
              ],
            },
          ],
        },
      },
      {
        label: "Các gói dịch vụ chuyên gia",
        menu: {
          groups: [
            {
              links: [
                { label: "Gói dịch vụ chuyên gia DBA", href: "/dba-goi-chuyen-gia-moi-gioi/" },
                { label: "Gói dịch vụ chuyên gia DWA", href: "/dwa-goi-chuyen-gia-tu-van-dau-tu-tai-chinh/" },
                { label: "Đăng ký tìm chuyên gia", href: "/dang-ky-tim-chuyen-gia/" },
              ],
            },
          ],
        },
      },
      {
        label: "Hỗ trợ",
        menu: {
          groups: [
            {
              title: "Hỗ trợ",
              href: "/category/support/",
              links: [
                // TODO: trang gốc có mục "Đặt lịch tư vấn" mở popup (href="#") — chưa dựng, chờ BA xác nhận đích đến.
                {
                  label: "Hướng dẫn: Nộp tiền vào tài khoản giao dịch tại VNDIRECT",
                  href: "/huong-dan-nop-tien-vao-tai-khoan-giao-dich-tai-vndirect/",
                },
                {
                  label: "Hướng dẫn cách mở tài khoản chứng khoán VNDIRECT online cho nhà đầu tư mới",
                  href: "/huong-dan-cach-mo-tai-khoan-chung-khoan-vndirect-online-cho-nha-dau-tu-moi/",
                },
              ],
            },
          ],
        },
      },
      {
        label: "Blog",
        menu: {
          groups: [
            {
              title: "Blog",
              href: "/blog/",
              links: [
                { label: "Nếp sống đầu tư", href: "/category/nep-song-dau-tu/" },
                { label: "Quản lý tài chính", href: "/category/quan-ly-tai-chinh/" },
                { label: "Ngẫm cùng chuyên gia", href: expertTalkPlaylistHref },
                { label: "Đọc chậm", href: "/category/doc-cham/" },
              ],
            },
          ],
        },
      },
    ],
    navMoreLabel: "Thêm mục menu",
    // Đủ chỗ cho cả 6 mục từ 1280px (đo 16/11/2026) — thêm mục menu thì đo lại, hạ số này nếu nav xuống dòng.
    navOverflowFrom: 6,
    navOverflowFromCompact: 6,
    scrollActions: [],
    secondaryAction: { label: "Tổng đài 1900 545 409", href: hotlineHref },
    primaryAction: { label: "Mở tài khoản", href: openAccountHref },
    primaryActionHrefs: [],
    overlayPaths: [],
    homeHref: "/",
  },
  footer: {
    navLabel: "Liên kết chân trang",
    groups: [
      {
        title: "Kiến thức đầu tư",
        links: [
          { label: "Câu chuyện đầu tư", href: "/category/cau-chuyen-dau-tu/" },
          { label: "DGO ACADEMY", href: dgoAcademyHref },
        ],
      },
      {
        title: "Sản phẩm",
        links: [
          { label: "DGROW - Tăng trưởng bền vững", href: "/dstock/" },
          { label: "DSIP - Bảo an thịnh vượng", href: "/dsip/" },
          { label: "DLIFE - Sức khỏe tài chính", href: "/dlife/" },
        ],
      },
    ],
    contact: {
      title: "Liên hệ",
      socials: [
        { icon: "facebook", label: "VNDIRECT Securities Corporation trên Facebook", href: facebookHref },
        { icon: "youtube", label: "VNDIRECT Official trên YouTube", href: youtubeHref },
      ],
      hotline: { label: "Tổng đài tư vấn: 1900 545 409", href: hotlineHref },
      email: { label: "daututaichinh@vndirect.com.vn", href: contactEmailHref },
      page: { label: "Danh sách mạng lưới chi nhánh", href: branchNetworkHref },
    },
    copyright: "Điều khoản sử dụng © 2018 Phát triển bởi VNDIRECT",
    legalLabel: "Pháp lý",
    legalLinks: [],
    slogan: "Nếp sống đầu tư.",
  },
} satisfies SiteContent;
