from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("blog", "0003_articlegalleryimage"),
    ]

    operations = [
        migrations.AddField(
            model_name="article",
            name="header_image",
            field=models.ImageField(blank=True, upload_to="articles/headers/", verbose_name="Шапка (горизонтальная)"),
        ),
        migrations.AlterField(
            model_name="article",
            name="cover_image",
            field=models.ImageField(blank=True, upload_to="articles/covers/", verbose_name="Обложка"),
        ),
    ]

