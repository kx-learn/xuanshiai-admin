"use client";

import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("分店管理", "门店管理");

export default function MendianListPage() {
  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>多门店（分店）系统，为拥有多家线下门店的婚恋公司，有招商加盟业务的品牌婚介公司提供了一整套的平台解决方案，可以实现在一套系统中由平台统一集权管理，对外共享一个线上平台统一进行会员展示、拓展客源和单线，又能让每个门店（或加盟商）拥有独立的管理平台。</p>
            <p><b>平台与分店间的分成与结算：</b>平台可以为每个分店设置独立的分成标准/分店名下会员在线上平台中支付的费用是统一进入跨到平台总账的微信商户账号中，平台根据与分店间达成的分成标准进行分成；分店的分成金额 实时计入到分店店长账号中的余额中，待分店随时在平台中进行提现支付使用</p>
            <p><b>分店红娘的分成与结账：</b>分店独立给自己门店下的红娘设置独立分成与结账，分店自行给自己的红娘结算，系统为分店生成相应的统计和报表数据，分店根据报表人工核算给红娘结账</p>
            <p><b>分店店长权限：</b>即分店的管理者，同时兼具动态普通红娘的身份，在门店管理平台中可以查看、操作、编辑在该门店下的全部客源信息、会员资料、联系方式、牵线记录等，并可以自行添加、管理分店下的红娘、提交关闭分店</p>
            <p><b>分店管理红娘：</b>在红娘平台中可以查看、操作、编辑在本分店中隶属于自己的全部客源信息、会员资料、联系方式、牵线记录等</p>
            <p><b>提示：</b>创建门店后在"红娘管理平台"中添加门店的"店长红娘"，未创建此账号之前无登录入口，入乡口只可能拥有一个店的红娘身份。店长登录"红娘管理平台"后可以自由添加管理店内的普通红娘</p>
            <p><b>提示：</b>门店状态为"关闭"时，门店管理系统将被禁止登录，其它名「红娘（各店长）登录管理平台时会提示门店关闭中，无法登录</p>
          </div>
        </div>
      </div>

      <div className="finord-card md-card">
        <div className="md-title">门店管理</div>
        <div className="md-empty">
          <div className="md-empty-text">该功能需要升级为"旗舰版"后使用</div>
        </div>
      </div>
    </div>
  );
}