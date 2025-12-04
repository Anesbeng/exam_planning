<div class="row">
    <div class="col-md-6">
        <label>Matricule</label>
        <input type="text" name="matricule" class="form-control" value="{{ $teacher->matricule ?? old('matricule') }}">
    </div>

    <div class="col-md-6">
        <label>Name</label>
        <input type="text" name="name" class="form-control" value="{{ $teacher->name ?? old('name') }}">
    </div>

    <div class="col-md-6 mt-2">
        <label>Email</label>
        <input type="email" name="email" class="form-control" value="{{ $teacher->email ?? old('email') }}">
    </div>


    @if (!isset($teacher))
        <div class="col-md-6 mt-2">
            <label>Password</label>
            <input type="password" name="password" class="form-control">
        </div>
    @endif


    <div class="col-md-6 mt-2">
        <label>Specialite</label>
        <input type="text" name="specialite" class="form-control"
            value="{{ $teacher->specialite ?? old('specialite') }}">
    </div>


</div>
