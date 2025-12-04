<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Import Modules</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
        }

        .alert {
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
        }

        .alert-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .alert-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .alert-warning {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }

        form {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            max-width: 500px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
        }

        input[type="file"] {
            display: block;
            margin-bottom: 15px;
            padding: 8px;
            width: 100%;
        }

        button {
            background: #667eea;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }

        button:hover {
            background: #5568d3;
        }

        .info {
            background: #e7f3ff;
            padding: 15px;
            border-left: 4px solid #2196F3;
            margin-bottom: 20px;
        }
    </style>
</head>

<body>

    <h2>📥 Importer des Modules</h2>

    @if (session('success'))
        <div class="alert alert-success">✅ {{ session('success') }}</div>
    @endif

    @if (session('error'))
        <div class="alert alert-error">❌ {{ session('error') }}</div>
    @endif

    @if (session('import_errors'))
        <div class="alert alert-warning">
            <strong>⚠️ Détails des erreurs :</strong>
            <ul>
                @foreach (session('import_errors') as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    @if ($errors->any())
        <div class="alert alert-error">
            @foreach ($errors->all() as $error)
                ❌ {{ $error }}<br>
            @endforeach
        </div>
    @endif

    <div class="info">
        <strong>ℹ️ Format attendu :</strong> Fichier CSV avec séparateur <code>;</code><br>
        <strong>Colonnes requises :</strong> Nom | Code | Semestre | Enseignant responsable<br>
        <strong>Exemple :</strong> <code>Mathématiques;MATH101;1;Dr. Dupont</code>
    </div>

    <form action="{{ route('admin.modules.import.submit') }}" method="POST" enctype="multipart/form-data">
        @csrf
        <label for="file">📂 Sélectionner le fichier CSV :</label>
        <input type="file" name="file" accept=".csv,.txt" required>
        <button type="submit">⬆️ Importer les modules</button>
    </form>

    <br>
    <a href="{{ route('admin.modules.index') }}" style="color: #667eea;">← Retour à la liste des modules</a>

</body>

</html>
