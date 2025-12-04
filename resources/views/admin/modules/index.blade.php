<h1>Liste des Modules</h1>

<a href="{{ route('admin.modules.create') }}">Ajouter un module</a>
<br><br>
<a href="{{ route('admin.modules.import') }}">➕ importer modules</a>

<table border="1" width="100%" cellpadding="8">
    <tr>

        <th>Nom du Module</th>
        <th>Code du module </th>
        <th>Semestre du module </th>
        <th>teacher responsible</th>
        <th>Actions</th>
    </tr>

    @foreach ($modules as $m)
        <tr>
            <td>{{ $m->name }}</td>
            <td>{{ $m->code }}</td>
            <td>{{ $m->semester }}</td>
            <td>{{ $m->teacher_responsible }}</td>

            <td>
                <a href="{{ route('admin.modules.edit', $m->id) }}">Modifier</a>
                |
                <form action="{{ route('admin.modules.destroy', $m->id) }}" method="POST" style="display:inline;">
                    @csrf
                    @method('DELETE')
                    <button type="submit">Supprimer</button>
                </form>
            </td>
        </tr>
    @endforeach
</table>
