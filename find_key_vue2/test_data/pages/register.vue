<template>
  <div class="register-page">
    <h1>{{ $t('auth.register.title') }}</h1>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>{{ $t('auth.register.email') }}</label>
        <input v-model="form.email" type="email" required />
      </div>
      
      <div class="form-group">
        <label>{{ $t('auth.register.username') }}</label>
        <input v-model="form.username" type="text" required />
      </div>
      
      <div class="form-group">
        <label>{{ $t('auth.register.password') }}</label>
        <input v-model="form.password" type="password" required />
      </div>
      
      <div class="form-group">
        <label>{{ $t('auth.register.confirmPassword') }}</label>
        <input v-model="form.confirmPassword" type="password" required />
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn-primary">
          {{ $t('auth.register.submit') }}
        </button>
        <button type="button" class="btn-secondary" @click="goBack">
          {{ $t('common.button.back') }}
        </button>
      </div>
    </form>
    
    <div class="links">
      <a href="/login">{{ $t('auth.register.login') }}</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterPage',
  data() {
    return {
      form: {
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
      }
    }
  },
  methods: {
    handleSubmit() {
      // 处理注册逻辑
      console.log('Register form submitted');
    },
    
    goBack() {
      this.$router.go(-1);
    }
  }
}
</script>
