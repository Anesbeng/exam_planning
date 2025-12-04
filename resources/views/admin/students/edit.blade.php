<!DOCTYPE html>
<html>

<head>
    <title>Edit Student</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
</head>

<body class="p-4">

    <h2>Edit Student</h2>

    <form action="{{ route('admin.students.update', $student->id) }}" method="POST">
        @csrf
        @method('PUT')

        @include('admin.students.form'),
        <br>

        <button type="submit" class="btn btn-primary">Update</button>
    </form>


</body>

</html>
