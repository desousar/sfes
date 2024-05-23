module.exports = {
  root: true,
  env: {
    node: true,
    jest: true
  },
  extends: ['plugin:vue/vue3-essential', 'eslint:recommended'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'off' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
};
