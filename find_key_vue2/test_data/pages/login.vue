<template>
  <div class="login-page">
    <h1>{{ $t('auth.login.title') }}</h1>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>{{ $t('auth.login.username') }}</label>
        <input v-model="form.username" type="text" required />
      </div>
      
      <div class="form-group">
        <label>{{ $t('auth.login.password') }}</label>
        <input v-model="form.password" type="password" required />
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn-primary">
          {{ $t('auth.login.submit') }}
        </button>
        <button type="button" class="btn-secondary" @click="goBack">
          {{ $t('common.button.back') }}
        </button>
      </div>
      
      <div class="links">
        <a href="#" @click="forgotPassword">
          {{ $t('auth.login.forgotPassword') }}
        </a>
        <a href="/register">
          {{ $t('auth.login.register') }}
        </a>
      </div>
    </form>
    
    <div v-if="loading" class="loading">
      {{ $t('common.message.loading') }}
    </div>
    
    <div v-if="message" :class="['message', messageType]">
      {{ $t(`common.message.${messageType}`) }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      loading: false,
      message: '',
      messageType: 'success'
    }
  },
  methods: {
    async handleSubmit() {
      this.loading = true;
      try {
        // 模拟登录逻辑
        await this.login();
        this.message = 'success';
        this.$t('common.message.success');
      } catch (error) {
        this.message = 'error';
        this.$t('common.message.error');
      } finally {
        this.loading = false;
      }
    },
    
    goBack() {
      this.$router.go(-1);
    },
    
    forgotPassword() {
      // 处理忘记密码
    },
    
    async login() {
      // 模拟登录API调用
      return new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
</script>

<style scoped>
.login-page {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.links {
  margin-top: 20px;
  text-align: center;
}

.links a {
  margin: 0 10px;
  color: #007bff;
  text-decoration: none;
}
</style>
