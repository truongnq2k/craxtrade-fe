import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// English translations (default language)
const en = {
  header: {
    credits: 'Credits',
    user: 'User',
    admin: 'Admin'
  },
  common: {
    balance: 'Balance',
    dashboard: 'Dashboard',
    signals: 'Signals',
    trades: 'Trades',
    transactions: 'Transactions',
    vouchers: 'Vouchers',
    news: 'News',
    accounts: 'Accounts',
    bots: 'Bots',
    createNew: 'Create New',
    loading: 'Loading...',
    error: 'Error',
    type: 'Type',
    used: 'Used',
    remaining: 'Remaining',
    description: 'Description',
    date: 'Date'
  }
}

// Vietnamese translations
const vi = {
  header: {
    credits: 'Credits',
    user: 'Người dùng',
    admin: 'Admin'
  },
  common: {
    balance: 'Số dư',
    dashboard: 'Dashboard',
    signals: 'Tín hiệu',
    trades: 'Giao dịch',
    transactions: 'Lịch sử',
    vouchers: 'Voucher',
    news: 'Tin tức',
    accounts: 'Tài khoản',
    bots: 'Bot',
    createNew: 'Tạo mới',
    loading: 'Đang tải...',
    error: 'Lỗi',
    type: 'Loại',
    used: 'sử dụng',
    remaining: 'còn lại',
    description: 'Mô tả',
    date: 'Ngày'
  }
}

const resources = {
  en: { translation: en },
  vi: { translation: vi }
}

i18n

  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
