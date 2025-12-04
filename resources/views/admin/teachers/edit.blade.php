<!DOCTYPE html>
<html>

<head>
    <title>Edit teacher</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
</head>

<body class="p-4">

    <h2>Edit teacher</h2>

    <form action="{{ route('admin.teachers.update', $teacher->id) }}" method="POST">
        @csrf
        @method('PUT')

        @include('admin.teachers.form'),
        <br>

        <button type="submit" class="btn btn-primary">Update</button>
    </form>


</body>

</html>
