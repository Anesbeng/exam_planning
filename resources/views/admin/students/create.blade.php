<!DOCTYPE html>
<html>

<head>
    <title>Add Student</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
</head>

<body class="p-4">

    <h2>Add Student</h2>

    <form action="{{ route('admin.students.store') }}" method="POST">
        @csrf

        @include('admin.students.form')

        <button class="btn btn-primary mt-3">Save</button>
    </form>

</body>

</html>
