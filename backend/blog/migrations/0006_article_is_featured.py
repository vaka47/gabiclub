from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("blog", "0005_articlesection"),
    ]

    operations = [
        migrations.AddField(
            model_name="article",
            name="is_featured",
            field=models.BooleanField(default=False, verbose_name="Показывать на главной"),
        ),
    ]

