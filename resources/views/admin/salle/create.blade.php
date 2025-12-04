<h1>Créer un salle</h1>

<form action="{{ route('admin.salle.store') }}" method="POST">
    @csrf

    Nom du salle :
    <input type="text" name="name">
    <br><br>
    Capacité du salle :
    <input type="text" name="capacity">
    <br><br>
    Emplacement du salle :
    <input type="text" name="location">
    <br><br>




    <button type="submit">Enregistrer</button>
</form>
