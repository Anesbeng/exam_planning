<h1>Ajouter un examen</h1>

<form method="POST" action="{{ route('exams.store') }}">
    @csrf

    <label>Type :</label>
    <select name="type" required>
        <option value="exam" selected>Examen</option>
        <option value="cc">Contrôle Continu</option>
        <option value="rattrapage">Rattrapage</option>
    </select>
    <br><br>

    <label>Module :</label>
    <input type="text" name="module" required>
    <br><br>

    <label>Teacher :</label>
    <input type="text" name="teacher" required>
    <br><br>

    <label>Room :</label>
    <input type="text" name="room" required>
    <br><br>

    <!-- FIXED: Niveau field -->
    <label>Niveau :</label>
    <select name="niveau" required>
        <option value="L1">L1</option>
        <option value="L2">L2</option>
        <option value="L3">L3</option>
        <option value="M1">M1</option>
        <option value="M2">M2</option>
    </select>
    <br><br>

    <label>Group :</label>
    <input type="text" name="group" required>
    <br><br>

    <label>Date :</label>
    <input type="date" name="date" required>
    <br><br>

    <label>Start Time :</label>
    <input type="time" name="start_time" required>
    <br><br>

    <label>End Time :</label>
    <input type="time" name="end_time" required>
    <br><br>

    <label> specialite:</label>
    <select name="specialite" required>
        <option value="informatique">informatique</option>
        <option value="st">st</option>
        <option value="englais">englais</option>
        <option value="francais">francais</option>
        <option value="biologie">biologie</option>
    </select>
    <br><br>

    <button type="submit">Save</button>
</form>
