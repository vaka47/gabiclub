from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("camps", "0002_alter_camp_options_remove_camp_image_and_more"),
        ("trainings", "0002_coach_leveltag_location_trainingdirection_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="camp",
            name="header_image",
            field=models.ImageField(
                blank=True,
                help_text="Широкое горизонтальное фото для шапки страницы и карточки кэмпа",
                upload_to="camps/header/",
                verbose_name="Горизонтальная шапка",
            ),
        ),
        migrations.AddField(
            model_name="camp",
            name="logistics",
            field=models.TextField(blank=True, verbose_name="Логистика"),
        ),
        migrations.AddField(
            model_name="camp",
            name="target_audience",
            field=models.TextField(blank=True, verbose_name="Кому подойдёт этот кэмп?"),
        ),
        migrations.AddField(
            model_name="camp",
            name="trainers",
            field=models.ManyToManyField(
                blank=True,
                related_name="camps",
                to="trainings.coach",
                verbose_name="Наши тренеры",
            ),
        ),
        migrations.CreateModel(
            name="CampInclusion",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("text", models.CharField(max_length=200, verbose_name="Пункт включено")),
                ("order", models.PositiveIntegerField(default=0, verbose_name="Порядок")),
                (
                    "camp",
                    models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="inclusions", to="camps.camp"),
                ),
            ],
            options={
                "verbose_name": "Что входит — пункт",
                "verbose_name_plural": "Что входит в стоимость",
                "ordering": ["order", "id"],
            },
        ),
    ]
