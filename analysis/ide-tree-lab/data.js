window.TREE_LAB = {
  navigation: [
    ['overview','研究概览','grid','06'],['solution','当前方案','ruler','NEW'],['ide','IDE 效果展示','tree','LIVE'],['compare','竞品对比','compare','05'],['lab','间距实验室','sliders','LIVE'],['type','图标与文字','type','Aa'],['guidelines','设计结论','check','08'],['sources','资料与方法','book','10']
  ],
  presets: {
    current:{name:'当前方案 · 标准',short:'20',color:'#3471dc',evidence:'当前设计建议',kind:'proposal',indent:20,font:16,icon:20,arrowSlot:20,row:28,arrowGap:4,labelGap:4,folderIcons:true,description:'基于 20px 箭头容器、20px 文件图标、16px 字号，建议默认缩进 20px、行高 28px。需通过真实目录任务验证。',source:'#solution'},
    compact:{name:'当前方案 · 紧凑',short:'16',color:'#278971',evidence:'当前设计建议',kind:'proposal',indent:16,font:16,icon:20,arrowSlot:20,row:28,arrowGap:4,labelGap:4,folderIcons:true,description:'保留字号、图标与行高，仅将缩进调为 16px；适合窄侧栏和深层目录，建议显示层级辅助线。',source:'#solution'},
    recommended:{name:'基础参考 · 14/16',short:'TL',color:'#3471dc',evidence:'设计建议',kind:'proposal',indent:16,font:14,icon:16,arrowSlot:16,row:24,arrowGap:4,labelGap:6,folderIcons:true,description:'以层级辨识和名称可见长度之间的平衡为起点。',source:'#guidelines'},
    idea:{name:'IntelliJ IDEA',short:'IJ',color:'#9252c9',evidence:'截图估算',kind:'estimate',indent:20,font:14,icon:16,arrowSlot:16,row:24,arrowGap:4,labelGap:4,folderIcons:true,description:'完整的箭头、图标和名称结构；更明显的缩进强调工程层级。',source:'https://www.jetbrains.com/help/idea/project-tool-window.html'},
    fleet:{name:'Fleet',short:'FL',color:'#a355d6',evidence:'历史截图估算',kind:'estimate',indent:16,font:14,icon:16,arrowSlot:16,row:26,arrowGap:4,labelGap:6,folderIcons:false,description:'参考 1.44 官方样本：目录省略文件夹图标，文件保留类型图标。',source:'https://blog.jetbrains.com/fleet/2024/12/fleet-1-44-is-here-with-new-ui-zig-language-support-and-more-enhancements/'},
    xcode:{name:'Xcode',short:'XC',color:'#328ee0',evidence:'旧版截图估算',kind:'estimate',indent:14,font:12,icon:16,arrowSlot:16,row:20,arrowGap:2,labelGap:4,folderIcons:true,description:'紧凑的原生导航列表。尺寸参考旧版官方帮助图，不代表 Xcode 27 默认值。',source:'https://help.apple.com/xcode/mac/current/en.lproj/deva4f92d838.html'},
    cursor:{name:'Cursor',short:'CU',color:'#4f5969',evidence:'VS Code 上游基线',kind:'source',indent:8,font:13,icon:16,arrowSlot:16,row:22,arrowGap:4,labelGap:6,folderIcons:true,description:'以 VS Code 上游尺寸构建的示意，不是 Cursor 当前版本实测。',source:'https://www.cursor.com/security'},
    trae:{name:'TRAE',short:'TR',color:'#278971',evidence:'VS Code 上游基线',kind:'source',indent:8,font:13,icon:16,arrowSlot:16,row:22,arrowGap:4,labelGap:6,folderIcons:true,description:'以 VS Code 上游尺寸构建的示意，未核实 TRAE 对这些尺寸的覆盖。',source:'https://docs.trae.cn/ide_changelog'}
  },
  cards:[
    {id:'compare',no:'01',category:'竞品研究',title:'五款 IDE，五种设计取舍',desc:'从 IntelliJ 的完整层级，到 Fleet 的轻量目录，观察文件树如何组织信息。',color:'blue',preview:'compare',tags:['IntelliJ','Fleet','Xcode','Cursor','TRAE'],href:'#compare'},
    {id:'spacing',no:'02',category:'交互实验',title:'几像素之间，找到平衡',desc:'亲手调节箭头、图标与名称的间距，看看视觉分组如何发生变化。',color:'peach',preview:'spacing',tags:['间距','箭头','可调参数'],href:'#lab'},
    {id:'hierarchy',no:'03',category:'交互实验',title:'缩进，决定层级的清晰度',desc:'8、16、20px，同一份目录结构。比较空间节省与父子关系辨识。',color:'mint',preview:'hierarchy',tags:['层级','缩进','8 / 16 / 20'],href:'#lab?mode=hierarchy'},
    {id:'type',no:'04',category:'视觉规范',title:'图标和文字，刚刚好的比例',desc:'字号、图标和行高一起看。保持内容可读，也让密集列表有呼吸感。',color:'lilac',preview:'type',tags:['字号','图标','行高'],href:'#type'},
    {id:'guidelines',no:'05',category:'设计结论',title:'一套可以开始验证的规范',desc:'将分析转化为 8 个基础参数，以及对齐、点击和深层目录的设计原则。',color:'sand',preview:'spec',tags:['设计建议','Tokens','可复制'],href:'#guidelines'},
    {id:'sources',no:'06',category:'研究方法',title:'区分观察、证据与建议',desc:'回到官方截图与开源实现。每一个数值，都说明它从哪里来。',color:'slate',preview:'sources',tags:['来源','测量口径','可信度'],href:'#sources'}
  ],
  tree:[
    {id:'root',name:'my-workspace',folder:true,depth:0},
    {id:'src',parent:'root',name:'src',folder:true,depth:1},
    {id:'features',parent:'src',name:'features',folder:true,depth:2},
    {id:'account',parent:'features',name:'account',folder:true,depth:3},
    {id:'settings',parent:'account',name:'AccountSettings.tsx',depth:4,type:'react'},
    {id:'test',parent:'account',name:'AccountSettings.test.tsx',depth:4,type:'react'},
    {id:'billing',parent:'features',name:'billing',folder:true,depth:3},
    {id:'billing-file',parent:'billing',name:'BillingOverview.tsx',depth:4,type:'react'},
    {id:'shared',parent:'src',name:'shared',folder:true,depth:2},
    {id:'button',parent:'shared',name:'Button.tsx',depth:3,type:'react'},
    {id:'styles',parent:'src',name:'styles',folder:true,depth:2},
    {id:'css',parent:'styles',name:'global.css',depth:3,type:'css'},
    {id:'package',parent:'root',name:'package.json',depth:1,type:'json'},
    {id:'readme',parent:'root',name:'README.md',depth:1,type:'md'}
  ],
  sources:[
    ['IntelliJ IDEA · Project tool window','官方文档 / 截图估算','观察完整图标结构、层级缩进与辅助线；帮助页版本不等同截图的实际构建版本。','https://www.jetbrains.com/help/idea/project-tool-window.html'],
    ['Fleet 1.44 · New UI','官方发布 / 历史样本','目录不显示文件夹图标，文件保留类型图标。示意采用量级近似，不是像素级复刻。','https://blog.jetbrains.com/fleet/2024/12/fleet-1-44-is-here-with-new-ui-zig-language-support-and-more-enhancements/'],
    ['Xcode · Project navigator','官方帮助 / 旧版样本','用于分析经典导航器的密度与结构；尺寸不代表 Xcode 27 的默认设置。','https://help.apple.com/xcode/mac/current/en.lproj/deva4f92d838.html'],
    ['VS Code · Icon label','开源实现 / 源码基线','16px 图标宽度，6px 图标到名称的布局留白。主题可能改变可见图形。','https://github.com/microsoft/vscode/blob/main/src/vs/base/browser/ui/iconLabel/iconlabel.css'],
    ['VS Code · Tree layout','开源实现 / 测量口径','箭头包含宽度、padding 与 transform，不能将单个 CSS 值当成可见空白。','https://github.com/microsoft/vscode/blob/main/src/vs/base/browser/ui/tree/media/tree.css'],
    ['VS Code · Tree indentation','开源实现 / 源码基线','workbench.tree.indent 默认值 8，可配置。辅助线也有独立配置。','https://github.com/microsoft/vscode/blob/main/src/vs/platform/list/browser/listService.ts'],
    ['VS Code · Typography & row height','开源实现 / 源码基线','基础工作台字号 13px；Explorer 的 ITEM_HEIGHT 为 22px。','https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/files/browser/views/explorerViewer.ts'],
    ['Cursor · 技术说明与用户反馈','官方说明 / 一手反馈','确认上游关联；缩进反馈可提示问题，但不能替代系统用户测试。','https://forum.cursor.com/t/folder-structure-panel-needs-indent-guides-and-possibly-larger-indents/17895'],
    ['TRAE · 更新日志','官方文档 / 技术关联','记录 VS Code 内核升级。技术关联不能证明两者所有 UI 参数一致。','https://docs.trae.cn/ide_changelog'],
    ['The Future of Fleet','官方说明 / 产品状态','Fleet 已停止提供下载，作为历史交互设计参考。','https://blog.jetbrains.com/fleet/2025/12/the-future-of-fleet/']
  ]
};
