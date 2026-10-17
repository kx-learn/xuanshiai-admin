"use client";

import { X } from "lucide-react";
import type { MatchmakerTutorial } from "@/lib/admin-endpoints";

/** 红娘/推广红娘「图文解说」共用弹窗：内容来自 GET /admin/matchmakers/tutorial。 */
export default function TutorialDialog({ tutorial, onClose }: { tutorial: MatchmakerTutorial; onClose: () => void }) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel hm-tutorial-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭">
              <X size={18} />
            </button>
            <span className="tlc-panel-title">{tutorial.title}</span>
          </div>
        </div>
        <div className="tlc-panel-body">
          <div className="hm-tutorial-content" style={{ whiteSpace: "pre-wrap" }}>{tutorial.content}</div>
          {tutorial.link_url ? (
            <a className="hm-tutorial-link" href={tutorial.link_url} target="_blank" rel="noreferrer">
              {tutorial.link_url}
            </a>
          ) : null}
        </div>
      </div>
    </>
  );
}
