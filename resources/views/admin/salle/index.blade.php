<h1>Liste des salles</h1>

<a href="{{ route('admin.salle.create') }}">Ajouter un module</a>
<br><br>

<table border="1" width="100%" cellpadding="8">
    <tr>

        <th>Nom du salle</th>
        <th>Capacité</th>
        <th>location</th>
        <th>Actions</th>
    </tr>

    @foreach ($salle as $m)
        <tr>
            <td>{{ $m->name }}</td>
            <td>{{ $m->capacity }}</td>
            <td>{{ $m->location }}</td>


            <td>
                <a href="{{ route('admin.salle.edit', $m->id) }}">Modifier</a>
                |
                <form action="{{ route('admin.salle.destroy', $m->id) }}" method="POST" style="display:inline;">
                    @csrf
                    @method('DELETE')
                    <button type="submit">Supprimer</button>
                </form>
            </td>
        </tr>
    @endforeach
</table>
