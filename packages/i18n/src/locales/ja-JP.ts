/**
 * Japanese (ja-JP) translation strings.
 * Keys are dot-separated paths. Values are never interpolated with code logic.
 * Use {{variable}} for runtime interpolation.
 */
export const jaJP = {
  // App
  'app.name': 'KakeiVault',
  'app.tagline': 'かんたん家計・書類管理',

  // Navigation
  'nav.dashboard': 'ダッシュボード',
  'nav.transactions': '取引',
  'nav.scan': 'スキャン',
  'nav.scanUpload': 'スキャン＆アップロード',
  'nav.salarySlips': '給与明細',
  'nav.documents': '書類',
  'nav.budgets': '予算',
  'nav.settings': '設定',

  // Auth
  'auth.login': 'ログイン',
  'auth.logout': 'ログアウト',
  'auth.register': 'アカウント作成',
  'auth.email': 'メールアドレス',
  'auth.password': 'パスワード',
  'auth.forgotPassword': 'パスワードを忘れた場合',
  'auth.resetPassword': 'パスワードをリセット',
  'auth.verifyEmail': 'メールを確認',
  'auth.emailVerificationSent': '確認メールを送信しました。メールをご確認ください。',
  'auth.emailVerified': 'メールアドレスが確認されました。',
  'auth.passwordMinLength': 'パスワードは8文字以上にしてください',
  'auth.passwordRequiresUppercase': 'パスワードには大文字を含めてください',
  'auth.passwordRequiresDigit': 'パスワードには数字を含めてください',
  'auth.invalidCredentials': 'メールアドレスまたはパスワードが正しくありません',
  'auth.rateLimited': 'しばらく経ってから再試行してください',
  'auth.confirmPassword': 'パスワード（確認）',
  'auth.passwordsDoNotMatch': 'パスワードが一致しません',
  'auth.registerSuccess': 'アカウントを作成しました。確認メールをご確認ください。',
  'auth.alreadyHaveAccount': 'すでにアカウントをお持ちの方は',
  'auth.noAccount': 'アカウントをお持ちでない方は',
  'auth.duplicateEmail': 'このメールアドレスはすでに使用されています',
  'auth.welcomeBack': 'おかえりなさい',
  'auth.createAccountTitle': 'アカウント作成',
  'auth.signInToContinue': 'KakeiVaultにログインしてください',
  'auth.loggingIn': 'ログイン中...',
  'auth.registering': '登録中...',

  // Dashboard
  'dashboard.title': 'ダッシュボード',
  'dashboard.totalIncome': '収入合計',
  'dashboard.totalExpenses': '支出合計',
  'dashboard.savings': '貯蓄',
  'dashboard.remainingBudget': '残り予算',
  'dashboard.recentTransactions': '最近の取引',
  'dashboard.categorySpending': 'カテゴリ別支出',
  'dashboard.noBudgetSet': '予算が設定されていません',
  'dashboard.noTransactions': '取引がありません',

  // Transactions
  'transaction.income': '収入',
  'transaction.expense': '支出',
  'transaction.date': '日付',
  'transaction.amount': '金額',
  'transaction.merchant': '店舗名',
  'transaction.category': 'カテゴリ',
  'transaction.paymentMethod': '支払方法',
  'transaction.notes': 'メモ',
  'transaction.create': '取引を追加',
  'transaction.edit': '取引を編集',
  'transaction.delete': '取引を削除',
  'transaction.confirmDelete': 'この取引を削除しますか？',

  // Payment methods
  'paymentMethod.cash': '現金',
  'paymentMethod.credit_card': 'クレジットカード',
  'paymentMethod.debit_card': 'デビットカード',
  'paymentMethod.electronic_money': '電子マネー',
  'paymentMethod.bank_transfer': '銀行振込',
  'paymentMethod.qr_code': 'QRコード',
  'paymentMethod.other': 'その他',

  // Categories
  'category.food': '食費',
  'category.daily_necessities': '日用品',
  'category.transportation': '交通費',
  'category.rent': '家賃',
  'category.utilities': '光熱費',
  'category.medical': '医療費',
  'category.education': '教育費',
  'category.entertainment': '娯楽費',
  'category.shopping': 'ショッピング',
  'category.insurance': '保険',
  'category.tax': '税金',
  'category.other': 'その他',

  // Document categories
  'documentCategory.salary_slip': '給与明細',
  'documentCategory.tax': '税務書類',
  'documentCategory.insurance': '保険書類',
  'documentCategory.employment': '雇用関連',
  'documentCategory.utility': '公共料金',
  'documentCategory.invoice': '請求書',
  'documentCategory.warranty': '保証書',
  'documentCategory.other': 'その他',

  // OCR
  'ocr.status.uploaded': 'アップロード済み',
  'ocr.status.queued': '処理待ち',
  'ocr.status.processing': '処理中',
  'ocr.status.review_required': '確認が必要',
  'ocr.status.confirmed': '確定済み',
  'ocr.status.failed': '失敗',
  'ocr.status.deleted': '削除済み',
  'ocr.scanning': 'スキャン中...',
  'ocr.reviewTitle': 'スキャン結果を確認',
  'ocr.lowConfidence': '信頼度が低い項目',
  'ocr.confirmTransaction': '取引を確定',
  'ocr.correctData': 'データを修正',

  // Budget
  'budget.title': '予算',
  'budget.monthly': '月次予算',
  'budget.overall': '全体予算',
  'budget.category': 'カテゴリ予算',
  'budget.set': '予算を設定',
  'budget.warning.over': '{{category}}の予算を超過しています（{{percent}}%）',
  'budget.warning.near': '{{category}}の予算が残りわずかです（{{percent}}%）',

  // Documents
  'document.title': '書類名',
  'document.date': '書類日付',
  'document.tags': 'タグ',
  'document.notes': 'メモ',
  'document.upload': '書類をアップロード',
  'document.download': 'ダウンロード',
  'document.delete': '削除',
  'document.confirmDelete': 'この書類を削除しますか？',
  'document.retention': '保存期間',

  // Salary
  'salary.employerName': '会社名',
  'salary.paymentMonth': '支給月',
  'salary.basicSalary': '基本給',
  'salary.overtime': '残業代',
  'salary.allowances': '手当',
  'salary.grossSalary': '総支給額',
  'salary.incomeTax': '所得税',
  'salary.residentTax': '住民税',
  'salary.pension': '厚生年金',
  'salary.healthInsurance': '健康保険',
  'salary.employmentInsurance': '雇用保険',
  'salary.otherDeductions': 'その他控除',
  'salary.totalDeductions': '控除合計',
  'salary.netSalary': '手取り額',
  'salary.confirm': '給与を確定',
  'salary.validation.grossMismatch': '総支給額と各項目の合計が一致しません',
  'salary.validation.deductionsMismatch': '控除合計と各控除の合計が一致しません',
  'salary.validation.netMismatch': '手取り額が総支給額から控除合計を引いた値と一致しません',
  'salary.validation.negativeNet': '手取り額がマイナスになっています',

  // Receipt validation
  'receipt.validation.subtotalPlusTaxMismatch': '小計＋消費税が合計と一致しません',
  'receipt.validation.lineItemSumMismatch': '明細の合計が請求額と一致しません',
  'receipt.validation.negativeTotal': '合計金額がマイナスになっています',

  // Settings
  'settings.language': '言語',
  'settings.language.ja': '日本語',
  'settings.language.en': 'English',
  'settings.privacySettings': 'プライバシー設定',
  'settings.exportData': 'データをエクスポート',
  'settings.deleteAccount': 'アカウントを削除',
  'settings.deleteAccountConfirm':
    'アカウントとすべてのデータを完全に削除します。この操作は取り消せません。',

  // Common
  'common.save': '保存',
  'common.cancel': 'キャンセル',
  'common.delete': '削除',
  'common.edit': '編集',
  'common.confirm': '確定',
  'common.back': '戻る',
  'common.next': '次へ',
  'common.loading': '読み込み中...',
  'common.error': 'エラーが発生しました',
  'common.retry': '再試行',
  'common.noData': 'データがありません',
  'common.search': '検索',
  'common.filter': '絞り込み',
  'common.export': 'エクスポート',
  'common.required': '必須',
  'common.optional': '任意',

  // Errors
  'error.network': 'ネットワークエラーが発生しました',
  'error.unauthorized': '認証が必要です',
  'error.forbidden': 'アクセスが拒否されました',
  'error.notFound': '見つかりませんでした',
  'error.serverError': 'サーバーエラーが発生しました',
  'error.fileTooLarge': 'ファイルサイズが大きすぎます（最大20MB）',
  'error.unsupportedFile': 'サポートされていないファイル形式です',

  // Offline
  'offline.draft': '下書き（オフライン）',
  'offline.uploading': 'アップロード中',
  'offline.synced': '同期済み',
  'offline.failed': 'アップロード失敗',
  'offline.retrying': '再試行中',
} as const

export type TranslationKey = keyof typeof jaJP
