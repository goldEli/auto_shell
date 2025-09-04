<template>
  <div class="profile-page">
    <h1>{{ $t('user.profile.title') }}</h1>
    
    <div class="profile-section">
      <h2>{{ $t('user.profile.personalInfo') }}</h2>
      <h2>{{ $t('auth.login.username') }}</h2>
      
      <form @submit.prevent="saveProfile">
        <div class="form-group">
          <label>{{ $t('user.profile.firstName') }}</label>
          <input v-model="profile.firstName" type="text" />
        </div>
        
        <div class="form-group">
          <label>{{ $t('user.profile.lastName') }}</label>
          <input v-model="profile.lastName" type="text" />
        </div>
        
        <div class="form-group">
          <label>{{ $t('user.profile.email') }}</label>
          <input v-model="profile.email" type="email" />
        </div>
        
        <div class="form-group">
          <label>{{ $t('user.profile.phone') }}</label>
          <input v-model="profile.phone" type="tel" />
        </div>
        
        <button type="submit" class="btn-primary">
          {{ $t('user.profile.save') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserProfilePage',
  data() {
    return {
      profile: {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      }
    }
  },
  methods: {
    saveProfile() {
      // 保存资料逻辑
      console.log('Profile saved');
    }
  }
}
</script>
