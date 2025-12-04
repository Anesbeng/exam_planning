<h1>Modifier un Module</h1>

<form action="{{ route('admin.modules.update', $module->id) }}" method="POST">
    @csrf
    @method('PUT')

    Nom du module :
    <input type="text" name="name" value="{{ $module->name }}">
    <br><br>
    Code du module :
    <input type="text" name="code" value="{{ $module->code }}">

    <br><br>
    Semestre du module :
    <input type="text" name="semester" value="{{ $module->semester }}">

    <br><br>
    <label>teacher responsible :</label>
    <select name="teacher_responsible" required>
        @foreach ($teachers as $teacher)
            <option value="{{ $teacher->name }}" {{ $module->teacher_responsible == $teacher->name ? 'selected' : '' }}>
                {{ $teacher->name }}</option>
        @endforeach
    </select>
    <br><br>
    <button type="submit">Mettre à jour</button>
</form>
