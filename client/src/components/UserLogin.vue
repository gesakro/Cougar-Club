<template>
  <div>
    <!-- Navbar agregado -->
    <NavBar />
    
    <div class="login-container">
      <header class="login-header">
        <h2>Sign In</h2>
      </header>
  
      <main class="login-content">
        <section class="welcome-section">
          <h3>Welcome</h3>
          <p>Sign in with your email and your password.</p>
        </section>
  
        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email"><strong>Email</strong></label>
            <input type="email" id="email" v-model="email" required />
          </div>
  
          <div class="form-group">
            <label for="password">Password*</label>
            <input type="password" id="password" v-model="password" required />
          </div>
  
          <a href="#" class="forgot-password"><strong>Forgot your password?</strong></a>
  
          <div class="divider"></div>
  
          <button type="submit" class="signin-btn"><strong>Sign In</strong></button>
  
          <p class="signup-link">
            Don’t have an Account? <a href="#">Create an Account.</a>
          </p>
  
          <div class="divider"></div>
  
          <div class="toggle-section">
            <span><strong>Or</strong></span>
            <button type="button" class="google-btn">
              Sign in with Google
            </button>
          </div>
        </form>
  
        <section class="benefits-section">
          <h3>Why a Cougar Club Account?</h3>
          <ul>
            <li>Find your orders and then access to your products.</li>
            <li>Manage your personal information.</li>
            <li>Review emails from Google Club.</li>
            <li>Create your website, browse back and once.</li>
          </ul>
        </section>
      </main>
  
      <footer class="login-footer">
        <table>
          <tr>
            <th>Help</th>
            <th>Services</th>
            <th>About Cougar Club</th>
            <th>E-mail Sign-in</th>
          </tr>
          <tr>
            <td>Abnormal certificate 779</td>
            <td>Service 1</td>
            <td>AT & Drivers</td>
            <td>Sign up the Cougar club available and receive plus assistance for any service you can visit or receive.</td>
          </tr>
          <tr>
            <td>Public</td>
            <td>Service 2</td>
            <td>Sustainability</td>
            <td>ARP launched and received</td>
          </tr>
        </table>
        <p class="footer-brand"><strong>Cougar Club</strong></p>
      </footer>
    </div>
  </div>
</template>
  
<script>
import NavBar from "@/components/AppNavbar.vue";

export default {
  name: 'UserLogin',
  components: {
    NavBar
  },
  data() {
    return {
      email: '',
      password: ''
    };
  },
  methods: {
    handleLogin() {
      console.log('Login attempt with:', this.email, this.password);
    }
  }
};
</script>
  
<!-- Importa el CSS externo -->
<style src="@/assets/styles/login.css"></style>
