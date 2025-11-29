<h3>Welcome {{ auth()->user()->name }}</h3>

<p>This is your homepage.</p>
<p>Your role is: {{ auth()->user()->role }}</p>
<p>Your matricule is: {{ auth()->user()->matricule }}</p>
<p>Your email is: {{ auth()->user()->email }}</p>
<p>Your group is: {{ auth()->user()->groupe }}</p>

<p>Your niveau is: {{ auth()->user()->niveau }}</p>
<p>Your specialite is: {{ auth()->user()->specialite }}</p>



<a href="{{ url('/logout') }}">Logout</a>

<h2>📘 Examens</h2>

<table border="1" width="100%" cellpadding="8">
    <tr>
        <th>Module</th>
        <th>Teacher</th>
        <th>Room</th>
        <th>Niveau</th>
        <th>Group</th>
        <th>Date</th>
        <th>Start</th>
        <th>End</th>
        <th>semester</th>

    </tr>

    @forelse ($examList as $exam)
        @if (auth()->user()->groupe == $exam->group &&
                auth()->user()->niveau == $exam->niveau &&
                auth()->user()->specialite == $exam->specialite)
            <tr>
                <td>{{ $exam->module }}</td>
                <td>{{ $exam->teacher }}</td>
                <td>{{ $exam->room }}</td>
                <td>{{ $exam->niveau }}</td>
                <td>{{ $exam->group }}</td>
                <td>{{ $exam->date }}</td>
                <td>{{ $exam->start_time }}</td>
                <td>{{ $exam->end_time }}</td>
                <td>{{ $exam->semester }}</td>
            </tr>
        @endif

    @empty
        <tr>
            <td colspan="8" class="text-center">No exams found.</td>
        </tr>
    @endforelse
</table>

<br>
<h2>📙
    Contrôle Continu</h2>
<table border="1" width="100%" cellpadding="8">
    <tr>
        <th>Module</th>
        <th>Teacher</th>
        <th>Room</th>
        <th>Niveau</th>
        <th>Group</th>
        <th>Date</th>
        <th>Start</th>
        <th>End</th>
        <th>semester</th>

    </tr>

    @forelse ($ccList as $exam)
        @if (auth()->user()->groupe == $exam->group &&
                auth()->user()->niveau == $exam->niveau &&
                auth()->user()->specialite == $exam->specialite)
            <tr>
                <td>{{ $exam->module }}</td>
                <td>{{ $exam->teacher }}</td>
                <td>{{ $exam->room }}</td>
                <td>{{ $exam->niveau }}</td>
                <td>{{ $exam->group }}</td>
                <td>{{ $exam->date }}</td>
                <td>{{ $exam->start_time }}</td>
                <td>{{ $exam->end_time }}</td>

                <td>{{ $exam->semester }}</td>

            </tr>
        @endif

    @empty
        <tr>
            <td colspan="8" class="text-center">No exams found.</td>
        </tr>
    @endforelse

</table>
<br>
<h2>📕
    Rattrapages</h2>
<table border="1" width="100%" cellpadding="8">

    <tr>
        <th>Module</th>
        <th>Teacher</th>
        <th>Room</th>
        <th>Niveau</th>
        <th>Group</th>
        <th>Date</th>
        <th>Start</th>
        <th>End</th>
        <th>semester</th>
    </tr>

    @forelse ($rattrapageList as $exam)
        @if (auth()->user()->groupe == $exam->group &&
                auth()->user()->niveau == $exam->niveau &&
                auth()->user()->specialite == $exam->specialite)
            <tr>
                <td>{{ $exam->module }}</td>
                <td>{{ $exam->teacher }}</td>
                <td>{{ $exam->room }}</td>
                <td>{{ $exam->niveau }}</td>
                <td>{{ $exam->group }}</td>
                <td>{{ $exam->date }}</td>
                <td>{{ $exam->start_time }}</td>
                <td>{{ $exam->end_time }}</td>
                <td>{{ $exam->semester }}</td>
            </tr>
        @endif

    @empty
        <tr>
            <td colspan="8" class="text-center">No exams found.</td>
        </tr>
    @endforelse
</table>
