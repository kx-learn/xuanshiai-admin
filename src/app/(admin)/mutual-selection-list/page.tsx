"use client";

import { useState } from "react";
import { X, Type, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, Quote, List, ListOrdered, Link2, Image as ImageIcon, Smile, Code, Heading1, Heading2, RotateCcw, RotateCw, Maximize2, Minus, Plus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("活动报名", "活动管理");

const TOOLBAR: { icon: React.ReactNode; title: string }[] = [
  { icon: <Heading1 size={14} />, title: "标题" },
  { icon: <Type size={14} />, title: "正文" },
  { icon: <Bold size={14} />, title: "加粗" },
  { icon: <Italic size={14} />, title: "斜体" },
  { icon: <Underline size={14} />, title: "下划线" },
  { icon: <Strikethrough size={14} />, title: "删除线" },
  { icon: <AlignLeft size={14} />, title: "左对齐" },
  { icon: <AlignCenter size={14} />, title: "居中" },
  { icon: <AlignRight size={14} />, title: "右对齐" },
  { icon: <Quote size={14} />, title: "引用" },
  { icon: <Link2 size={14} />, title: "链接" },
  { icon: <ImageIcon size={14} />, title: "图片" },
  { icon: <Smile size={14} />, title: "表情" },
  { icon: <Code size={14} />, title: "代码" },
  { icon: <List size={14} />, title: "无序列表" },
  { icon: <ListOrdered size={14} />, title: "有序列表" },
  { icon: <Minus size={14} />, title: "分割线" },
  { icon: <RotateCcw size={14} />, title: "撤销" },
  { icon: <RotateCw size={14} />, title: "重做" },
  { icon: <Maximize2 size={14} />, title: "全屏" },
];

const columns = ["ID", "活动名称", "创建时间", "活动时间", "活动状态", "真实报名人数", "参与嘉宾", "上线", "链接/二维码", "操作"];

export default function MutualSelectionListPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [online, setOnline] = useState(false);
  const [syncTitle, setSyncTitle] = useState(false);
  const [realname, setRealname] = useState(false);
  const [avatar, setAvatar] = useState(false);
  const [threePhoto, setThreePhoto] = useState(false);
  const [wechatInfo, setWechatInfo] = useState(false);
  const [redNote, setRedNote] = useState(true);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>互选CP活动是目前非常流行且受欢迎的一种线上交友形式,参与者可以在互选大厅中,自主浏览并选择自己心仪的对象,当两个人都选择了对方,视为互选成功,即可互加微信(微信加个推报片名)。</p>
            <p>互选活动可以有效的帮婚恋公司获取单身客源、激活推广客户、还能大大提高客户与红娘之间的粘性和沟通,提高销售转化。同时,互选的结果也给红娘提供了非常精准的数据依据,判断新客户的意向和择偶需求,帮助红娘提高配精准度。</p>
            <p>活动流程: 1.创建活动 2.活动宣传邀约报名(这是最重要的获客引流环节) 3.互选活动开始 4.活动结束(红娘根据选择结果进行逐一面访邀约) 5.活动回顾。</p>
            <p>互选活动分为三种状态:</p>
            <p>1、报名中: 在活动开始之前活动状态为"报名中",会员可以在线报名加入活动,管理员也可以在后手动将其报名加入活动中。</p>
            <p>2、进行中: 在活动开始时间后,活动状态自动变更为"进行中",不可以再报名,所有已报名会员在活动结束时间之前可以查看对方已加心意嘉宾;</p>
            <p>3、已结束: 在活动结束时间之后,活动状态自动变更为"已结束",所有参与嘉宾的信息将不再允许被任何人浏览。</p>
            <p>重点逻辑说明:</p>
            <p>1、在活动单位参与互选时,管理员也可以选择已设定的心动嘉宾数,活动结束之后每位参与可对已选择嘉宾发取消心动,取消后不计入次数;</p>
            <p>2、活动结束之后,才可以查看哪些嘉宾选择了自己;</p>
            <p>3、活动结束之后,若互选都选择了对方心动嘉宾,则被视为"互选成功",嘉宾自行添加对方微信号或者由红娘介入互推微信名片。</p>
          </div>
        </div>
      </div>

      <div className="finord-card ms-card">
        <div className="ms-head">
          <h2 className="ms-title">活动管理</h2>
          <button className="finord-btn finord-btn-primary ms-create-btn" onClick={() => setAddOpen(true)}>＋ 创建活动</button>
        </div>

        <div className="ms-filters">
          <input className="ms-input" placeholder="请输入关键字搜索" />
          <button className="finord-btn finord-btn-primary ms-search-btn">搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table ms-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="ms-row-content">
                    <input type="checkbox" className="ms-check" />
                    <span className="ms-id">4</span>
                  </div>
                </td>
                <td>
                  <div className="ms-activity">
                    <div className="ms-cover ms-cover-mutual">6月<br />互选<br />开始啦</div>
                    <div className="ms-activity-info">
                      <div className="ms-activity-name">6月互选开始啦</div>
                    </div>
                  </div>
                </td>
                <td className="ms-time">2026-06-05 12:03:29</td>
                <td>
                  <div className="ms-time-block">
                    <div>开始：2026-06-30 08:59</div>
                    <div>结束：2026-06-30 23:59</div>
                  </div>
                </td>
                <td><span className="ms-status">活动结束</span></td>
                <td>
                  <div className="ms-count">
                    <div>男生 <span className="ms-count-num">1</span>人</div>
                    <div>女生 <span className="ms-count-num">1</span>人</div>
                  </div>
                </td>
                <td><a className="finord-link">添加/查看</a></td>
                <td>
                  <button type="button" className={`mp-switch ${online ? "on" : ""}`} onClick={() => setOnline(!online)}>
                    <span className="mp-switch-knob"></span>
                  </button>
                </td>
                <td><a className="finord-link">查看</a></td>
                <td>
                  <div className="ms-ops">
                    <a className="finord-link">群发短信</a>
                    <a className="finord-link">编辑</a>
                    <a className="finord-link">复制</a>
                    <a className="finord-link">删除</a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="ms-pager">
          <span className="ms-pager-arrow">‹</span>
          <span className="ms-pager-cur">1</span>
          <span className="ms-pager-arrow">›</span>
        </div>
      </div>

      {addOpen && (
        <CreateMutualDrawer
          onClose={() => setAddOpen(false)}
          syncTitle={syncTitle} setSyncTitle={setSyncTitle}
          realname={realname} setRealname={setRealname}
          avatar={avatar} setAvatar={setAvatar}
          threePhoto={threePhoto} setThreePhoto={setThreePhoto}
          wechatInfo={wechatInfo} setWechatInfo={setWechatInfo}
          redNote={redNote} setRedNote={setRedNote}
        />
      )}
    </div>
  );
}

function CreateMutualDrawer({ onClose, syncTitle, setSyncTitle, realname, setRealname, avatar, setAvatar, threePhoto, setThreePhoto, wechatInfo, setWechatInfo, redNote, setRedNote }: {
  onClose: () => void;
  syncTitle: boolean; setSyncTitle: (v: boolean) => void;
  realname: boolean; setRealname: (v: boolean) => void;
  avatar: boolean; setAvatar: (v: boolean) => void;
  threePhoto: boolean; setThreePhoto: (v: boolean) => void;
  wechatInfo: boolean; setWechatInfo: (v: boolean) => void;
  redNote: boolean; setRedNote: (v: boolean) => void;
}) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel ms-drawer-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">添加活动</span>
          </div>
          <div className="ms-head-actions">
            <button className="finord-btn ms-cancel" onClick={onClose}>取消</button>
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 活动标题 */}
          <div className="ms-row">
            <span className="ms-label">＊活动标题</span>
            <div className="ms-content">
              <input className="ms-input-wide" placeholder="最多80字符" />
              <div className="ms-info">活动标题参考</div>
            </div>
          </div>

          {/* 封面图片 */}
          <div className="ms-row ms-row-top">
            <span className="ms-label">＊封面图片</span>
            <div className="ms-content">
              <div className="ms-pick">
                <Plus size={18} /><span>上传图片</span>
              </div>
              <button type="button" className="ms-cloud-btn">📷 从云端素材</button>
              <div className="ms-info">① 最佳尺寸：900×383（与公众号首图一致）</div>
            </div>
          </div>

          {/* 活动时间 */}
          <div className="ms-row">
            <span className="ms-label">＊活动时间</span>
            <div className="ms-content">
              <div className="ms-daterange">
                <span>开始日期</span>
                <input className="ms-date" type="date" />
                <span className="ms-text-muted">→</span>
                <span>结束日期</span>
                <input className="ms-date" type="date" />
              </div>
              <div className="ms-info">① 在开始日期之前,活动状态为"报名中",可报名;开始时间之后为"进行中",不可再报名,所有已报名会员在活动结束时间之前可以查看对方已加心意嘉宾;在结束时间之后,活动状态自动变更为"已结束"。</div>
            </div>
          </div>

          {/* 选择人数 */}
          <div className="ms-row">
            <span className="ms-label">选择人数</span>
            <div className="ms-content">
              <div className="ms-fee-row">
                <input className="ms-num" defaultValue="5" />
                <span className="ms-unit">次</span>
              </div>
              <div className="ms-info">① 本次活动参与嘉宾可以选择的心动嘉宾人数</div>
            </div>
          </div>

          {/* 显示报名人数 */}
          <div className="ms-row">
            <span className="ms-label">显示报名人数</span>
            <div className="ms-content">
              <input className="ms-num" defaultValue="0" />
              <div className="ms-info">① 平台中显示报名人数将在此设置数值上累加</div>
            </div>
          </div>

          {/* 活动费用 */}
          <div className="ms-row">
            <span className="ms-label">活动费用</span>
            <div className="ms-content">
              <div className="ms-fee-row">
                <span>男生</span>
                <input className="ms-num" defaultValue="0" />
                <span className="ms-unit">元</span>
                <span>女生</span>
                <input className="ms-num" defaultValue="0" />
                <span className="ms-unit">元</span>
                <span>VIP会员</span>
                <input className="ms-num" defaultValue="0" />
                <span className="ms-unit">元</span>
              </div>
              <div className="ms-info">① 0表示免费。本费用需报名人在线支付;VIP会员包含线上和线下的两种类型</div>
            </div>
          </div>

          {/* 红娘奖励 */}
          <div className="ms-row">
            <span className="ms-label">红娘奖励</span>
            <div className="ms-content">
              <div className="ms-fee-row">
                <span>推广红娘奖励</span>
                <input className="ms-num" defaultValue="0" />
                <span className="ms-unit">元</span>
                <span>服务红娘奖励</span>
                <input className="ms-num" defaultValue="0" />
                <span className="ms-unit">元</span>
              </div>
              <div className="ms-info">① 会员报名本活动支付费用后,其所属推广红娘、服务红娘获得的奖励金额,0表示不奖励,红娘在微信中转发活动详情页,客户点击关注后即可跟我们红娘绑定归属关系</div>
            </div>
          </div>

          {/* 报名要求 */}
          <div className="ms-row ms-row-top">
            <span className="ms-label">报名要求</span>
            <div className="ms-content">
              <div className="ms-checks-row">
                <label className="ms-checkbox">
                  <input type="checkbox" checked={realname} onChange={() => setRealname(!realname)} />
                  <span>实名认证</span>
                </label>
                <label className="ms-checkbox">
                  <input type="checkbox" checked={avatar} onChange={() => setAvatar(!avatar)} />
                  <span>必须有头像</span>
                </label>
                <label className="ms-checkbox">
                  <input type="checkbox" checked={threePhoto} onChange={() => setThreePhoto(!threePhoto)} />
                  <span>必须至少有3张照片</span>
                </label>
              </div>
              <div className="ms-form-grid">
                <span className="ms-form-item">年龄：<em className="ms-required">必填</em></span>
                <span className="ms-form-item">学历：<em className="ms-required">必填</em></span>
                <span className="ms-form-item">收入：<select className="ms-select-inline"><option>请选择</option></select></span>
              </div>
            </div>
          </div>

          {/* 活动介绍 */}
          <div className="ms-row ms-row-top">
            <span className="ms-label">＊活动介绍</span>
            <div className="ms-content">
              <div className="ms-editor">
                <div className="ms-editor-toolbar">
                  {TOOLBAR.map((it, idx) => (
                    <button key={idx} type="button" className="ms-editor-tool" title={it.title}>{it.icon}</button>
                  ))}
                </div>
                <div className="ms-editor-body" contentEditable suppressContentEditableWarning>
                  <p className="ms-editor-placeholder">请输入正文</p>
                </div>
              </div>
              <div className="ms-link-row">
                <a className="finord-link">查看别人怎么写的</a>
              </div>
              <div className="ms-required-text">请输入活动介绍</div>
            </div>
          </div>

          {/* 分享标题 */}
          <div className="ms-row">
            <span className="ms-label">分享标题</span>
            <div className="ms-content">
              <div className="ms-share-row">
                <input className="ms-input-wide" placeholder="不要超出50文字" />
                <label className="ms-checkbox ms-checkbox-right">
                  <input type="checkbox" checked={syncTitle} onChange={() => setSyncTitle(!syncTitle)} />
                  <span>同步标题</span>
                </label>
              </div>
            </div>
          </div>

          {/* 分享描述 */}
          <div className="ms-row ms-row-top">
            <span className="ms-label">分享描述</span>
            <div className="ms-content">
              <textarea className="ms-textarea" rows={3} defaultValue="自主浏览并选择自己心仪的嘉宾,当两个人都选择了对方,视为互选成功,即可互加微信(互加微信号前请将对方红娘撮合在红娘管理及绑定归属关系。互选活动结果也将给红娘提供非常精准的数据依据,判断新客户的意向和择偶需求,帮助红娘提高配精准度。" />
            </div>
          </div>

          {/* 分享图标 */}
          <div className="ms-row ms-row-top">
            <span className="ms-label">分享图标</span>
            <div className="ms-content">
              <div className="ms-icon-row">
                <div className="ms-pick ms-pick-square"><Plus size={18} /><span>上传图标</span></div>
                <button type="button" className="ms-cloud-btn">📷 从云端素材</button>
              </div>
            </div>
          </div>

          {/* 互选成功后 */}
          <div className="ms-row ms-row-top">
            <span className="ms-label">互选成功后</span>
            <div className="ms-content">
              <div className="ms-radio-row">
                <label className="ms-radio">
                  <input type="radio" name="wechatInfo" value="show" checked={wechatInfo} onChange={() => setWechatInfo(true)} />
                  <span>显示双方微信信息已加</span>
                </label>
                <a className="finord-link">效果参考</a>
                <label className="ms-radio">
                  <input type="radio" name="wechatInfo" value="hide" checked={!wechatInfo} onChange={() => setWechatInfo(false)} />
                  <span>提示联系红娘推送微信号</span>
                </label>
                <a className="finord-link">效果参考</a>
              </div>
            </div>
          </div>

          {/* 进入嘉宾互选时弹出的须知 */}
          <div className="ms-row ms-row-top">
            <span className="ms-label">进入嘉宾互选时弹出的须知</span>
            <div className="ms-content">
              <div className="ms-note-box">
                <div>想在本次活动中可以选择心仪嘉宾为心仪对象;</div>
                <div>活动结束之前您可以取消已选的嘉宾,不计入人数;</div>
                <div>活动结束后,互选选择的心动嘉宾可以查对方微信号。</div>
              </div>
              <div className="ms-link-row">
                <a className="finord-link">效果参考</a>
              </div>
            </div>
          </div>

          {/* 互选成功后添加微信页面提示 */}
          <div className="ms-row ms-row-top">
            <span className="ms-label">互选成功后添加微信页面的提示</span>
            <div className="ms-content">
              <div className="ms-note-box">
                <div>这是一个有温度的交友平台,希望大家在尊重、严肃认真对待</div>
                <div>流程择偶标准,也无论最终100%的准确命中率,更无法确保真实的</div>
                <div>诚信交友!请慎重交友!</div>
              </div>
              {redNote && <div className="ms-required-text">互选成功后添加微信页面的提示必填</div>}
            </div>
          </div>

          <div className="ms-submit-row">
            <button className="finord-btn finord-btn-primary ms-submit">确定提交</button>
          </div>
        </div>
      </div>
    </>
  );
}