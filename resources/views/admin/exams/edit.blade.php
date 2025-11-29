<h1>Edit Exam</h1>

<form method="POST" action="{{ route('exams.update', $exam->id) }}">
    @csrf
    @method('PUT')

    Type:
    <select name="type">
        <option value="exam" {{ $exam->type == 'exam' ? 'selected' : '' }}>Examen</option>
        <option value="cc" {{ $exam->type == 'cc' ? 'selected' : '' }}>CC</option>
        <option value="rattrapage" {{ $exam->type == 'rattrapage' ? 'selected' : '' }}>Rattrapage</option>
    </select>
    <br><br>

    Module: <input type="text" name="module" value="{{ $exam->module }}"><br><br>
    Teacher: <input type="text" name="teacher" value="{{ $exam->teacher }}"><br><br>
    Room: <input type="text" name="room" value="{{ $exam->room }}"><br><br>

    Niveau:
    <select name="niveau">
        <option value="L1" {{ $exam->niveau == 'L1' ? 'selected' : '' }}>L1</option>
        <option value="L2" {{ $exam->niveau == 'L2' ? 'selected' : '' }}>L2</option>
        <option value="L3" {{ $exam->niveau == 'L3' ? 'selected' : '' }}>L3</option>
        <option value="M1" {{ $exam->niveau == 'M1' ? 'selected' : '' }}>M1</option>
        <option value="M2" {{ $exam->niveau == 'M2' ? 'selected' : '' }}>M2</option>
    </select><br><br>

    Group: <input type="text" name="group" value="{{ $exam->group }}"><br><br>
    Date: <input type="date" name="date" value="{{ $exam->date }}"><br><br>
    Start Time: <input type="time" name="start_time" value="{{ $exam->start_time }}"><br><br>
    End Time: <input type="time" name="end_time" value="{{ $exam->end_time }}"><br><br>


    specialite:
    <select name="specialite">
        <option value="informatique" {{ $exam->specialite == 'informatique' ? 'selected' : '' }}>informatique</option>
        <option value="st" {{ $exam->specialite == 'st' ? 'selected' : '' }}>st</option>
        <option value="englais"{{ $exam->specialite == 'englais' ? 'selected' : '' }}>englais</option>
        <option value="francais" {{ $exam->specialite == 'francais' ? 'selected' : '' }}>francais</option>
        <option value="biologie" {{ $exam->specialite == 'biologie' ? 'selected' : '' }}>biologie</option>
    </select><br><br>

    Semester:
    <select name="semester">
        <option value="S1" {{ $exam->semester == 'S1' ? 'selected' : '' }}>S1</option>
        <option value="S2" {{ $exam->semester == 'S2' ? 'selected' : '' }}>S2</option>
    </select><br><br>

    <button type="submit">Update</button>
</form>
