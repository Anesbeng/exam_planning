<!DOCTYPE html>
<html>

<head>
    <title>teachers List</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
</head>

<body class="p-4">

    @if (session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    <h2>teachers List</h2>

    <a href="{{ route('admin.teachers.create') }}" class="btn btn-primary mb-3">Add teacher</a>

    <form method="GET" action="{{ route('admin.teachers.index') }}" class="mb-3">
        <div class="input-group">
            <input type="text" name="search" class="form-control" placeholder="Search by name, matricule, email..."
                value="{{ request('search') }}">
            <button class="btn btn-primary">Search</button>
        </div>
    </form>

    <table class="table table-bordered">
        <thead>
            <tr>
                <th>Matricule</th>
                <th>Name</th>
                <th>Email</th>
                <th>Specialite</th>

                <th>Action</th>
            </tr>
        </thead>

        <tbody>
            @foreach ($teachers as $teacher)
                <tr>
                    <td>{{ $teacher->matricule }}</td>
                    <td>{{ $teacher->name }}</td>
                    <td>{{ $teacher->email }}</td>
                    <td>{{ $teacher->specialite }}</td>
                    <td>
                        <a href="{{ route('admin.teachers.edit', $teacher->id) }}"
                            class="btn btn-warning btn-sm">Edit</a>

                        <form action="{{ route('admin.teachers.destroy', $teacher->id) }}" method="POST"
                            style="display:inline;">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="btn btn-danger btn-sm">Delete</button>
                        </form>

                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

</body>

</html>
