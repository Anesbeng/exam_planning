<h1>Créer un Module</h1>

<form action="{{ route('admin.modules.store') }}" method="POST">
    @csrf

    Nom du module :
    <input type="text" name="name">
    <br><br>
    Code du module :

    <input type="text" name="code">
    <br><br>
    Semestre du module :
    <input type="text" name="semester">
    <br><br>

    <label>Teacher responsible:</label>
    <select name="teacher_responsible" required>
        @foreach ($teachers as $teacher)
            <option value="{{ $teacher->name }}">{{ $teacher->name }}</option>
        @endforeach
    </select>

    <br><br>





    <button type="submit">Enregistrer</button>
</form>
