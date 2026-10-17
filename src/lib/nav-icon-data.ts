/**
 * 原站导航图标数据（抓取自原站 navconfig 分包与页面快照，图片已落地 public/refimg/icons）。
 * CU[g][s][k] = 区块 g（0头部主导航一/1头部主导航二/2底部导航）的风格 s（0-4 对应 风格1-5）的第 k 个导航项图标。
 */
export const NAV_ICON_BASE = "/refimg/icons/";

export const CU: string[][][] = [
  [
    ["/refimg/icons/20220620162939583676.png", "/refimg/icons/20220620162902532637.png", "/refimg/icons/20220620163005263349.png", "/refimg/icons/20220620163152987595.png", "/refimg/icons/20220620163201868740.png"],
    ["/refimg/icons/20221028173235525358.png", "/refimg/icons/20221028173326870921.png", "/refimg/icons/20221028173346701974.png", "/refimg/icons/20221028173400581415.png", "/refimg/icons/20221028173414837086.png"],
    ["/refimg/icons/20221028174648432180.png", "/refimg/icons/20221028174747755258.png", "/refimg/icons/20221028174853162597.png", "/refimg/icons/20221028174922685465.png", "/refimg/icons/20221028174938535990.png"],
    ["/refimg/icons/20221028175448121887.png", "/refimg/icons/20221028180420779492.png", "/refimg/icons/20221028175507894076.png", "/refimg/icons/20221028180442776037.png", "/refimg/icons/20221028180500237668.png"],
    ["/refimg/icons/20221028180829582018.png", "/refimg/icons/20221028180848611060.png", "/refimg/icons/20221028180905155160.png", "/refimg/icons/20221028180922292974.png", "/refimg/icons/20221028180937805163.png"],
  ],
  [
    ["/refimg/icons/20220620163225538429.png", "/refimg/icons/20220620163233828636.png", "/refimg/icons/20220620163239482339.png", "/refimg/icons/20220620163246661907.png", "/refimg/icons/20220620163252552799.png"],
    ["/refimg/icons/20221028173751264084.png", "/refimg/icons/20221028173951701292.png", "/refimg/icons/20221028174029449534.png", "/refimg/icons/20221028174047599497.png", "/refimg/icons/20221028174109195091.png"],
    ["/refimg/icons/20221028175210393485.png", "/refimg/icons/20221028175238268412.png", "/refimg/icons/20221028175305901547.png", "/refimg/icons/20221028175326256980.png", "/refimg/icons/20221028175348754278.png"],
    ["/refimg/icons/20221028180617204724.png", "/refimg/icons/20221028180635582619.png", "/refimg/icons/20221028180652777123.png", "/refimg/icons/20221028180711136122.png", "/refimg/icons/20221028180727774981.png"],
    ["/refimg/icons/20221028181020938088.png", "/refimg/icons/20221028181041778582.png", "/refimg/icons/20221028181059150148.png", "/refimg/icons/20221028181117178653.png", "/refimg/icons/20221028181133202246.png"],
  ],
  [
    ["/refimg/icons/20221001125141267107.png", "/refimg/icons/20220928112438976245.png", "/refimg/icons/20220928111953620164.png", "/refimg/icons/20220928111859752456.png", "/refimg/icons/20220928111916351932.png", "/refimg/icons/20220928112604430700.png", "/refimg/icons/20220928112835117945.png"],
    ["/refimg/icons/20221028094819215971.png", "/refimg/icons/20221028094901267842.png", "/refimg/icons/20221028095008607978.png", "/refimg/icons/20221028171012337991.png", "/refimg/icons/20221028171044373404.png", "/refimg/icons/20221028095135108636.png", "/refimg/icons/20221028095213747130.png"],
    ["/refimg/icons/20221028095717430523.png", "/refimg/icons/20221028095743268338.png", "/refimg/icons/20221028095908903547.png", "/refimg/icons/20221028171339400562.png", "/refimg/icons/20221028171413274284.png", "/refimg/icons/20221028095810508964.png", "/refimg/icons/20221028095829383376.png"],
    ["/refimg/icons/20221028100753194964.png", "/refimg/icons/20221028100825916540.png", "/refimg/icons/20221028100934534907.png", "/refimg/icons/20221028172136718754.png", "/refimg/icons/20221028172202270190.png", "/refimg/icons/20221028100842230180.png", "/refimg/icons/20221028100858706463.png"],
    ["/refimg/icons/20221028101322318812.png", "/refimg/icons/20221028101349752224.png", "/refimg/icons/20221028101519931169.png", "/refimg/icons/20221028172502416450.png", "/refimg/icons/20221028172527140452.png", "/refimg/icons/20221028101402772954.png", "/refimg/icons/20221028101420580039.png"],
  ],
];

/** 风格预览整图 ft{区块}-{风格}（原站 u-admin-loveindex-ft*），仅头部主导航一/二、底部导航有 */
export const styleCardImage = (group: number, style: number) =>
  `${NAV_ICON_BASE}u-admin-loveindex-ft${group}-${style}.jpg`;

