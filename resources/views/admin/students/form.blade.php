<div class="row">
    <div class="col-md-6">
        <label>Matricule</label>
        <input type="text" name="matricule" class="form-control" value="{{ $student->matricule ?? old('matricule') }}">
    </div>

    <div class="col-md-6">
        <label>Name</label>
        <input type="text" name="name" class="form-control" value="{{ $student->name ?? old('name') }}">
    </div>

    <div class="col-md-6 mt-2">
        <label>Email</label>
        <input type="email" name="email" class="form-control" value="{{ $student->email ?? old('email') }}">
    </div>

    @if (!isset($student))
        <div class="col-md-6 mt-2">
            <label>Password</label>
            <input type="password" name="password" class="form-control">
        </div>
    @endif

    <div class="col-md-6 mt-2">
        <label>Specialite</label>
        <input type="text" name="specialite" class="form-control"
            value="{{ $student->specialite ?? old('specialite') }}">
    </div>

    <div class="col-md-6 mt-2">
        <label>Niveau</label>
        <input type="text" name="niveau" class="form-control" value="{{ $student->niveau ?? old('niveau') }}">
    </div>

    <div class="col-md-6 mt-2">
        <label>Année scolaire</label>
        <input type="text" name="annee_scolaire" class="form-control"
            value="{{ $student->annee_scolaire ?? old('annee_scolaire') }}">
    </div>

    <div class="col-md-6 mt-2">
        <label>Groupe</label>
        <input type="text" name="groupe" class="form-control" value="{{ $student->groupe ?? old('groupe') }}">
    </div>
</div>
