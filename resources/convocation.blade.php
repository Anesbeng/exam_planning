<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Convocation d'Examen</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }

        .container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .header {
            background: linear-gradient(135deg, #3A5377 0%, #0B2844 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
            margin: -30px -30px 30px -30px;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
        }

        .greeting {
            font-size: 18px;
            color: #0B2844;
            margin-bottom: 20px;
        }

        .exam-details {
            background-color: #F8FAFC;
            border-left: 4px solid #3A5377;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }

        .exam-details h3 {
            margin-top: 0;
            color: #0B2844;
        }

        .detail-row {
            display: flex;
            margin: 10px 0;
        }

        .detail-label {
            font-weight: bold;
            color: #3A5377;
            min-width: 120px;
        }

        .detail-value {
            color: #0B2844;
        }

        .student-count {
            background-color: #EEF2F8;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
            margin: 20px 0;
            font-size: 18px;
            font-weight: bold;
            color: #3A5377;
        }

        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #E2E8F0;
            font-size: 14px;
            color: #64748B;
            text-align: center;
        }

        .university {
            font-weight: bold;
            color: #0B2844;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>📋 Convocation d'Examen</h1>
        </div>

        <p class="greeting">
            Bonjour <strong>{{ $teacherName }}</strong>,
        </p>

        <p>
            Une convocation a été générée pour l'examen dont vous êtes responsable.
            Veuillez prendre connaissance des informations ci-dessous :
        </p>

        <div class="exam-details">
            <h3>📚 Détails de l'Examen</h3>

            <div class="detail-row">
                <span class="detail-label">Type :</span>
                <span class="detail-value">{{ strtoupper($examType) }}</span>
            </div>

            <div class="detail-row">
                <span class="detail-label">Module :</span>
                <span class="detail-value">{{ $module }}</span>
            </div>

            <div class="detail-row">
                <span class="detail-label">Date :</span>
                <span class="detail-value">{{ \Carbon\Carbon::parse($date)->format('d/m/Y') }}</span>
            </div>

            <div class="detail-row">
                <span class="detail-label">Horaire :</span>
                <span class="detail-value">{{ $startTime }} - {{ $endTime }}</span>
            </div>

            <div class="detail-row">
                <span class="detail-label">Salle :</span>
                <span class="detail-value">{{ $room }}</span>
            </div>

            <div class="detail-row">
                <span class="detail-label">Niveau :</span>
                <span class="detail-value">{{ $niveau }} - Groupe {{ $group }}</span>
            </div>
        </div>

        <div class="student-count">
            👥 {{ $studentCount }} étudiant(s) convoqué(s)
        </div>

        <p>
            La liste complète des étudiants convoqués est disponible dans votre espace enseignant
            ou peut être téléchargée auprès du secrétariat.
        </p>

        <p>
            Merci de confirmer votre présence et de vous assurer que tous les préparatifs
            nécessaires sont effectués pour le bon déroulement de l'examen.
        </p>

        <div class="footer">
            <p class="university">
                Université Abou Bekr Belkaïd - Tlemcen<br>
                Département Informatique
            </p>
            <p>
                Cet email a été généré automatiquement par le système de gestion des examens.<br>
                Pour toute question, veuillez contacter le secrétariat.
            </p>
            <p style="margin-top: 15px; font-size: 12px;">
                © {{ date('Y') }} UABT - Tous droits réservés
            </p>
        </div>
    </div>
</body>

</html>
