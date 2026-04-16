import { createI18n } from 'vue-i18n'
import store from '../store'

const messages = {
  zh: {
    nav: { 
      dashboard: '可视化大屏',
      basicData: '基础数据管理', 
      procurement: '采购管理', 
      inventory: '库存管理', 
      requisition: '门店要货与配送', 
      sales: '销售统计' 
    },
    header: { systemName: '嘻嘻茶 物料供应管理平台' },
    dashboard: {
      tabs: { hq: '总部核心看板', store: '门店运营看板' },
      cards: { totalStock: '全线库存总量', stockValue: '库存总资产', salesTarget: '年度销售达成', warningCount: '急需补货提醒' },
      charts: {
        stockDist: '各类物料占比',
        salesTrend: '销售走势',
        purchaseFlow: '采购支出对比',
        lossRadar: '损耗维度',
        capacityGauge: '主仓库容率'
      },
      table: { trend: '走势' }
    },
    sales: {
      tabs: { records: '销售记录', deduction: '自动扣料', analysis: '分析看板' },
      table: { orderNo: '销售单号', product: '产品', qty: '数量', total: '总额', date: '日期' },
      cards: { todaySales: '今日销量', monthRevenue: '本月营收', exceptionLoss: '异常损耗', deductionCount: '扣料单数' },
      charts: { trendTitle: '销售趋势', lossTitle: '损耗分析' }
    },
    basicData: {
      tabs: { material: '物料档案', org: '组织架构', role: '用户角色', bom: 'BOM表' },
      toolbar: { search: '搜索', add: '添加' },
      table: { 
        code: '物料编码', name: '物料名称', category: '类别', stock: '库存', unit: '单位', actions: '操作', 
        index: '序号', roleName: '角色名称', roleDesc: '角色描述', roleUsers: '用户数', status: '状态', 
        emptyOrg: '暂无组织数据', bomId: 'BOM编号', bomProduct: '产品', bomVersion: '版本', 
        bomMaterials: '物料数', bomCost: '成本', unitPrice: '单价' 
      },
      form: { 
        addTitle: '新增物料', editTitle: '编辑物料', name: '名称', namePlaceholder: '请输入物料名称', 
        category: '类别', categoryPlaceholder: '请选择类别', unit: '单位', unitPlaceholder: '请输入单位', 
        stock: '库存', cancel: '取消', confirm: '确认' 
      },
      messages: { 
        ruleName: '请输入物料名称', ruleCategory: '请选择类别', ruleUnit: '请输入单位', 
        addSuccess: '物料添加成功', editSuccess: '物料更新成功' 
      },
      cards: { org: '组织数', role: '角色数', material: '物料数', bom: 'BOM数' }
    },
    procurement: {
      tabs: { apply: '采购申请', orders: '采购订单', inbound: '采购入库', return: '退货管理' },
      form: { 
        title: '采购申请表单', material: '物料', materialPlaceholder: '请选择物料', supplier: '供应商', 
        supplierAuto: '系统自动填充', qty: '数量', unit: '单位', submit: '提交申请' 
      },
      table: { 
        orderNo: '订单编号', material: '物料', supplier: '供应商', qty: '数量', amount: '金额', 
        status: '状态', actions: '操作', inboundBtn: '办理入库', returnBtn: '发起退货', date: '日期' 
      },
      status: { pending: '待处理', shipping: '运输中', received: '已入库', returning: '退货中' },
      inbound: { 
        scanBtn: '扫码入库', scanPlaceholder: '扫描或输入订单号', infoTitle: '入库信息', 
        emptyInfo: '暂无扫码数据', confirmBtn: '确认入库', recentTitle: '近期入库记录' 
      },
      returns: { 
        returnNo: '退货单号', reason: '退货原因', logisticsBtn: '查看物流', 
        step1: '发起退货', step2: '快递揽件', step3: '运输途中', step4: '已完成退款' 
      },
      dialog: { 
        inboundTitle: '入库确认', returnTitle: '退货确认', cancel: '取消', confirm: '确认', success: '操作成功' 
      }
    },
    inventory: {
      tabs: { batch: '批次管理', warning: '预警管理', inbound: '快捷入库', outbound: '快捷出库', check: '库存盘点' },
      table: { 
        code: '物料编码', name: '物料名称', batchNo: '批次号', stock: '库存', status: '状态', 
        actions: '操作', supplier: '供应商', location: '库位', inDate: '入库日期', expDate: '过期日期' 
      },
      warning: { 
        title: '物料预警', lowStock: '库存不足', expiring: '即将过期', threshold: '预警阈值', 
        normal: '正常' 
      },
      dialog: { inTitle: '入库', outTitle: '出库', qty: '数量', remark: '备注', cancel: '取消', confirm: '确认' },
      cards: { totalStock: '总库存量', totalValue: '库存总值', lowStock: '库存不足', expiring: '即将过期' }
    },
    requisition: {
      tabs: { apply: '要货申请', delivery: '配送管理', receipt: '门店签收', return: '退换货' },
      form: { 
        title: '要货申请表单', store: '门店', material: '物料', qty: '数量', submit: '提交申请', 
        stockHint: '当前库存:' 
      },
      table: { 
        orderNo: '要货单号', store: '门店', material: '物料', qty: '数量', status: '状态', 
        actions: '操作', dispatch: '发车配送', sign: '确认签收', returnBtn: '发起退货' 
      },
      status: { pending: '待处理', shipping: '配送中', signed: '已签收', returning: '退货中' },
      receipt: { 
        scanBtn: '扫码签收', scanPlaceholder: '扫描或输入配送单号', infoTitle: '签收信息', 
        emptyInfo: '暂无扫码数据', confirmBtn: '确认签收', recentTitle: '近期签收记录' 
      },
      returns: { 
        returnNo: '退换单号', type: '类型', reason: '原因', logisticsBtn: '查看物流', 
        logisticsTitle: '物流追踪' 
      },
      dialog: { 
        signTitle: '签收确认', returnTitle: '退货确认', cancel: '取消', confirm: '确认', success: '操作成功' 
      }
    }
  },
  en: {
    nav: { 
      dashboard: 'Dashboard',
      basicData: 'Basic Data', 
      procurement: 'Procurement', 
      inventory: 'Inventory', 
      requisition: 'Requisition', 
      sales: 'Sales' 
    },
    header: { systemName: 'Xixi Tea SCM System' },
    dashboard: {
      tabs: { hq: 'HQ Panel', store: 'Store Panel' },
      cards: { totalStock: 'Total Stock', stockValue: 'Assets', salesTarget: 'Target', warningCount: 'Warning' },
      charts: { stockDist: 'Stock Ratio', salesTrend: 'Sales Trend', purchaseFlow: 'Purchase', lossRadar: 'Loss Radar', capacityGauge: 'Usage' },
      table: { trend: 'Trend' }
    },
    sales: {
      tabs: { records: 'Records', deduction: 'Deduction', analysis: 'Analysis' },
      table: { orderNo: 'ID', product: 'Product', qty: 'Qty', total: 'Total', date: 'Date' },
      cards: { todaySales: 'Today', monthRevenue: 'Revenue', exceptionLoss: 'Loss', deductionCount: 'Deduction' },
      charts: { trendTitle: 'Sales Trend', lossTitle: 'Loss Analysis' }
    },
    basicData: {
      tabs: { material: 'Materials', org: 'Organization', role: 'Roles', bom: 'BOM' },
      toolbar: { search: 'Search', add: 'Add' },
      table: { 
        code: 'Code', name: 'Name', category: 'Category', stock: 'Stock', unit: 'Unit', actions: 'Actions', 
        index: 'No', roleName: 'Role', roleDesc: 'Description', roleUsers: 'Users', status: 'Status', 
        emptyOrg: 'No organization data', bomId: 'BOM ID', bomProduct: 'Product', bomVersion: 'Version', 
        bomMaterials: 'Materials', bomCost: 'Cost', unitPrice: 'Unit Price' 
      },
      form: { 
        addTitle: 'Add Material', editTitle: 'Edit Material', name: 'Name', namePlaceholder: 'Enter material name', 
        category: 'Category', categoryPlaceholder: 'Select category', unit: 'Unit', unitPlaceholder: 'Enter unit', 
        stock: 'Stock', cancel: 'Cancel', confirm: 'Confirm' 
      },
      messages: { 
        ruleName: 'Please enter material name', ruleCategory: 'Please select category', ruleUnit: 'Please enter unit', 
        addSuccess: 'Material added successfully', editSuccess: 'Material updated successfully' 
      },
      cards: { org: 'Organization', role: 'Roles', material: 'Materials', bom: 'BOM' }
    },
    procurement: {
      tabs: { apply: 'Apply', orders: 'Orders', inbound: 'Inbound', return: 'Return' },
      form: { 
        title: 'Purchase Application', material: 'Material', materialPlaceholder: 'Select material', 
        supplier: 'Supplier', supplierAuto: 'Auto-filled by system', qty: 'Quantity', unit: 'Unit', 
        submit: 'Submit Application' 
      },
      table: { 
        orderNo: 'Order No', material: 'Material', supplier: 'Supplier', qty: 'Quantity', amount: 'Amount', 
        status: 'Status', actions: 'Actions', inboundBtn: 'Inbound', returnBtn: 'Return', date: 'Date' 
      },
      status: { pending: 'Pending', shipping: 'Shipping', received: 'Received', returning: 'Returning' },
      inbound: { 
        scanBtn: 'Scan QR Code', scanPlaceholder: 'Scan or enter order number', infoTitle: 'Inbound Information', 
        emptyInfo: 'No scanning data', confirmBtn: 'Confirm Inbound', recentTitle: 'Recent Inbound Records' 
      },
      returns: { 
        returnNo: 'Return No', reason: 'Reason', logisticsBtn: 'View Logistics', 
        step1: 'Return Request', step2: 'Pickup', step3: 'Shipping', step4: 'Refunded' 
      },
      dialog: { 
        inboundTitle: 'Inbound Confirmation', returnTitle: 'Return Confirmation', cancel: 'Cancel', 
        confirm: 'Confirm', success: 'Operation successful' 
      }
    },
    inventory: {
      tabs: { batch: 'Batch', warning: 'Warning', inbound: 'Inbound', outbound: 'Outbound', check: 'Stocktake' },
      table: { 
        code: 'Code', name: 'Name', batchNo: 'Batch No', stock: 'Stock', status: 'Status', 
        actions: 'Actions', supplier: 'Supplier', location: 'Location', inDate: 'Inbound Date', 
        expDate: 'Expiry Date' 
      },
      warning: { 
        title: 'Material Warnings', lowStock: 'Low Stock', expiring: 'Expiring', threshold: 'Threshold', 
        normal: 'Normal' 
      },
      dialog: { inTitle: 'Inbound', outTitle: 'Outbound', qty: 'Quantity', remark: 'Remark', cancel: 'Cancel', confirm: 'Confirm' },
      cards: { totalStock: 'Total Stock', totalValue: 'Total Value', lowStock: 'Low Stock', expiring: 'Expiring' }
    },
    requisition: {
      tabs: { apply: 'Apply', delivery: 'Delivery', receipt: 'Receipt', return: 'Return' },
      form: { 
        title: 'Requisition Application', store: 'Store', material: 'Material', qty: 'Quantity', 
        submit: 'Submit Application', stockHint: 'Current stock:' 
      },
      table: { 
        orderNo: 'Order No', store: 'Store', material: 'Material', qty: 'Quantity', status: 'Status', 
        actions: 'Actions', dispatch: 'Dispatch', sign: 'Sign', returnBtn: 'Return' 
      },
      status: { pending: 'Pending', shipping: 'Shipping', signed: 'Signed', returning: 'Returning' },
      receipt: { 
        scanBtn: 'Scan QR Code', scanPlaceholder: 'Scan or enter order number', infoTitle: 'Receipt Information', 
        emptyInfo: 'No scanning data', confirmBtn: 'Confirm Receipt', recentTitle: 'Recent Receipts' 
      },
      returns: { 
        returnNo: 'Return No', type: 'Type', reason: 'Reason', logisticsBtn: 'View Logistics', 
        logisticsTitle: 'Logistics Tracking' 
      },
      dialog: { 
        signTitle: 'Sign Confirmation', returnTitle: 'Return Confirmation', cancel: 'Cancel', 
        confirm: 'Confirm', success: 'Operation successful' 
      }
    }
  }
}

const i18n = createI18n({
  legacy: false,
  locale: store.state.language,
  fallbackLocale: 'zh',
  messages
})

export default i18n