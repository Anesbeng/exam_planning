<h1>Planning des Examens</h1>
<a href="{{ url('/logout') }}">Logout</a><br><br>
<a href="{{ route('exams.create') }}">➕ Ajouter un examen</a> <br><br>
<a href="{{ route('import.form') }}">➕ importer users</a> <br><br>

<h2>📘 Examens</h2>
<table border="1" width="100%" cellpadding="8">
    <tr>
        <th>Module</th>
        <th>Teacher</th>
        <th>Room</th>
        <th>specialite</th>
        <th>niveau</th>
        <th>Group</th>
        <th>Date</th>
        <th>Start</th>
        <th>End</th>
    </tr>

    @forelse ($examList as $exam)
        <tr>
            <td>{{ $exam->module }}</td>
            <td>{{ $exam->teacher }}</td>
            <td>{{ $exam->room }}</td>
            <td>{{ $exam->specialite }}</td>
            <td>{{ $exam->niveau }}</td>
            <td>{{ $exam->group }}</td>
            <td>{{ $exam->date }}</td>
            <td>{{ $exam->start_time }}</td>
            <td>{{ $exam->end_time }}</td>
            <td>
                <a href="{{ route('exams.edit', $exam->id) }}">✏️ Edit</a>

                <form action="{{ route('exams.destroy', $exam->id) }}" method="POST" style="display:inline;">
                    @csrf
                    @method('DELETE')
                    <button type="submit" onclick="return confirm('Delete this exam?')">🗑 Delete</button>
                </form>
            </td>

        </tr>
    @empty
        <tr>
            <td colspan="7">No exams found.</td>
        </tr>
    @endforelse
</table>

<br>
<h2>📙 Contrôle Continu</h2>
<table border="1" width="100%" cellpadding="8">
    <tr>
        <th>Module</th>
        <th>Teacher</th>
        <th>Room</th>
        <th>specialite</th>
        <th>niveau</th>
        <th>Group</th>
        <th>Date</th>
        <th>Start</th>
        <th>End</th>
    </tr>

    @forelse ($ccList as $exam)
        <tr>
            <td>{{ $exam->module }}</td>
            <td>{{ $exam->teacher }}</td>
            <td>{{ $exam->room }}</td>
            <td>{{ $exam->specialite }}</td>
            <td>{{ $exam->niveau }}</td>
            <td>{{ $exam->group }}</td>
            <td>{{ $exam->date }}</td>
            <td>{{ $exam->start_time }}</td>
            <td>{{ $exam->end_time }}</td>
            <td>
                <a href="{{ route('exams.edit', $exam->id) }}">✏️ Edit</a>

                <form action="{{ route('exams.destroy', $exam->id) }}" method="POST" style="display:inline;">
                    @csrf
                    @method('DELETE')
                    <button type="submit" onclick="return confirm('Delete this exam?')">🗑 Delete</button>
                </form>
            </td>

        </tr>
    @empty
        <tr>
            <td colspan="7">No CC exams found.</td>
        </tr>
    @endforelse
</table>

<br>

<h2>📕 Rattrapage</h2>
<table border="1" width="100%" cellpadding="8">
    <tr>
        <th>Module</th>
        <th>Teacher</th>
        <th>Room</th>
        <th>specialite</th>
        <th>niveau</th>
        <th>Group</th>
        <th>Date</th>
        <th>Start</th>
        <th>End</th>
    </tr>

    @forelse ($rattrapageList as $exam)
        <tr>
            <td>{{ $exam->module }}</td>
            <td>{{ $exam->teacher }}</td>
            <td>{{ $exam->room }}</td>
            <td>{{ $exam->specialite }}</td>
            <td>{{ $exam->niveau }}</td>
            <td>{{ $exam->group }}</td>
            <td>{{ $exam->date }}</td>
            <td>{{ $exam->start_time }}</td>
            <td>{{ $exam->end_time }}</td>
            <td>
                <a href="{{ route('exams.edit', $exam->id) }}">✏️ Edit</a>

                <form action="{{ route('exams.destroy', $exam->id) }}" method="POST" style="display:inline;">
                    @csrf
                    @method('DELETE')
                    <button type="submit" onclick="return confirm('Delete this exam?')">🗑 Delete</button>
                </form>
            </td>

        </tr>
    @empty
        <tr>
            <td colspan="7">No Rattrapage exams found.</td>
        </tr>
    @endforelse
</table>
