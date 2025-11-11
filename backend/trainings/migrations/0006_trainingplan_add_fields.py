from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("trainings", "0005_trainingplan_alter_coach_options_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="trainingplan",
            name="icon",
            field=models.CharField(blank=True, help_text="CSS-класс или emoji", max_length=120, verbose_name="Иконка"),
        ),
        migrations.AddField(
            model_name="trainingplan",
            name="buy_link",
            field=models.URLField(blank=True, verbose_name="Ссылка на покупку"),
        ),
        migrations.AddField(
            model_name="trainingplan",
            name="buy_label",
            field=models.CharField(blank=True, default="Приобрести", max_length=60, verbose_name="Текст кнопки"),
        ),
    ]

