<!DOCTYPE html>
<html>

<head>
    <title>Students List</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
</head>

<body class="p-4">

    @if (session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    <h2>Students List</h2>

    <a href="{{ route('admin.students.create') }}" class="btn btn-primary mb-3">Add Student</a>

    <form method="GET" action="{{ route('admin.students.index') }}" class="mb-3">
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
                <th>Niveau</th>
                <th>Groupe</th>
                <th>Action</th>
            </tr>
        </thead>

        <tbody>
            @foreach ($students as $student)
                <tr>
                    <td>{{ $student->matricule }}</td>
                    <td>{{ $student->name }}</td>
                    <td>{{ $student->email }}</td>
                    <td>{{ $student->specialite }}</td>
                    <td>{{ $student->niveau }}</td>
                    <td>{{ $student->groupe }}</td>

                    <td>
                        <a href="{{ route('admin.students.edit', $student->id) }}"
                            class="btn btn-warning btn-sm">Edit</a>

                        <form action="{{ route('admin.students.destroy', $student->id) }}" method="POST"
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
