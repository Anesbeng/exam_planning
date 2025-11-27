<h2>Login</h2>

<form method="POST" action="{{ url('/login') }}">
    @csrf
    <input type="text" name="matricule" placeholder="Matricule" required><br><br>
    <input type="password" name="password" placeholder="Password" required><br><br>
    <div style="text-align: center; margin-top: 15px;">
        <a href="{{ route('password.request') }}" style="color: #667eea;">Forgot Password?</a>
    </div>
    <button type="submit">Login</button>
</form>





@if (session('error'))
    <p style="color:red">{{ session('error') }}</p>
@endif

@if (session('status'))
    <p style="color:green">{{ session('status') }}</p>
@endif
