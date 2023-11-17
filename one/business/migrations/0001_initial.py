# Generated by Django 4.2.7 on 2023-11-17 13:27

from django.db import migrations, models
import django.db.models.deletion
import django_tenants.postgresql_backend.base


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Client",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "schema_name",
                    models.CharField(
                        db_index=True,
                        max_length=63,
                        unique=True,
                        validators=[django_tenants.postgresql_backend.base._check_schema_name],
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                ("paid_until", models.DateField()),
                ("on_trial", models.BooleanField()),
                ("created_on", models.DateField(auto_now_add=True)),
            ],
            options={
                "verbose_name": "Client",
                "verbose_name_plural": "Clients",
            },
        ),
        migrations.CreateModel(
            name="Domain",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("domain", models.CharField(db_index=True, max_length=253, unique=True)),
                ("is_primary", models.BooleanField(db_index=True, default=True)),
                (
                    "tenant",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, related_name="domains", to="business.client"
                    ),
                ),
            ],
            options={
                "verbose_name": "Domain",
                "verbose_name_plural": "Domains",
            },
        ),
    ]
