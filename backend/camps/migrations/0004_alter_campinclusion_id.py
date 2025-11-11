from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("camps", "0003_camp_extra_fields"),
    ]

    operations = [
        migrations.AlterField(
            model_name="campinclusion",
            name="id",
            field=models.BigAutoField(
                auto_created=True,
                primary_key=True,
                serialize=False,
                verbose_name="ID",
            ),
        ),
    ]

