<h1>Modifier un salle</h1>

<form action="{{ route('admin.salle.update', $salle->id) }}" method="POST">
    @csrf
    @method('PUT')

    Nom du salle :
    <input type="text" name="name" value="{{ $salle->name }}">
    <br><br>
    Capacité du salle :
    <input type="text" name="capacity" value="{{ $salle->capacity }}">
    <br><br>
    Emplacement du salle :
    <input type="text" name="location" value="{{ $salle->location }}">
    <br><br>



    <button type="submit">Mettre à jour</button>
</form>
