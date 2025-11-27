<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Import Utilisateurs</title>

</head>

<body>
    <div class="container">
        <h2>📊 Import Utilisateurs</h2>

        @if (session('success'))
            <div class="success">
                {{ session('success') }}
            </div>
        @endif

        @if (session('error'))
            <div class="error">
                {{ session('error') }}
            </div>
        @endif

        @if ($errors->any())
            <div class="error">
                @foreach ($errors->all() as $error)
                    {{ $error }}<br>
                @endforeach
            </div>
        @endif

        <form action="{{ url('/import') }}" method="POST" enctype="multipart/form-data">
            @csrf
            <div class="form-group">
                <label for="file"> Choisir un fichier Excel :</label>
                <input type="file" name="file" id="file" accept=".xlsx,.xls,.csv" required>
            </div>
            <button type="submit"> Importer les utilisateurs</button>
        </form>

    </div>
</body>

</html>
