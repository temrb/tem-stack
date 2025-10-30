#!/usr/bin/env node

/**
 * Feature Scaffolding CLI Script
 *
 * Initializes a new feature module in src/features/ with the following structure:
 * - api/ - tRPC routers and service layer
 * - components/ - React components
 * - lib/ - Types and validation schemas
 * - pages/ - Page components
 * - header-actions.ts - Header action definitions (optional)
 * - modals.ts - Modal definitions (optional)
 *
 * Usage:
 *   npm run create                                    # Interactive mode
 *   npm run create -- my-feature                      # Positional argument
 *   npm run create -- --name=my-feature               # Using --name flag
 *   npm run create -- --remove my-feature             # Remove a feature
 *   npm run create -- --dry-run my-feature            # Preview feature creation
 *   npm run create -- --remove --dry-run my-feature   # Preview feature removal
 */

import chalk from 'chalk';
import { access, mkdir, rm, writeFile } from 'fs/promises';
import minimist from 'minimist';
import path from 'path';
import prompts from 'prompts';
import { Project, SyntaxKind } from 'ts-morph';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

// --- UTILITIES ---

const log = {
	info: (msg) => console.log(chalk.blue(`ℹ ${msg}`)),
	success: (msg) => console.log(chalk.green(`✓ ${msg}`)),
	warn: (msg) => console.log(chalk.yellow(`⚠ ${msg}`)),
	error: (msg) => console.log(chalk.red(`✗ ${msg}`)),
	step: (msg) => console.log(`\n${chalk.cyan.bold(`━━━ ${msg}`)}`),
	dim: (msg) => console.log(chalk.dim(`  ${msg}`)),
	dryRun: (msg) => console.log(chalk.magenta(`[DRY RUN] ${msg}`)),
};

const kebabToPascal = (s) =>
	s.replace(/(^\w|-\w)/g, (c) => c.replace('-', '').toUpperCase());

const kebabToCamel = (s) =>
	s.replace(/-\w/g, (c) => c.substring(1).toUpperCase());

const kebabToTitle = (s) =>
	s
		.split('-')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');

// --- TEMPLATES (Identical to original, omitted for brevity) ---

const getApiIndexTemplate = (name) => `import { createTRPCRouter } from '@/trpc/server/api/site/trpc';
import { ${kebabToCamel(name)}Router } from './${name}';

/**
 * ${kebabToTitle(name)} Feature Router
 *
 * This is the main router for the ${name} feature.
 * Add additional routers here as the feature grows.
 */
export const ${kebabToCamel(name)}FeatureRouter = createTRPCRouter({
	main: ${kebabToCamel(name)}Router,
});
`;

const getApiModuleTemplate = (name) => `import { createTRPCRouter, protectedProcedure } from '@/trpc/server/api/site/trpc';
import * as z from 'zod';
import * as ${kebabToCamel(name)}Service from './services/${name}.service';

/**
 * ${kebabToTitle(name)} Router
 *
 * Defines tRPC procedures for the ${name} feature.
 * Business logic should be implemented in the service layer.
 */
export const ${kebabToCamel(name)}Router = createTRPCRouter({
	/**
	 * Example procedure
	 * Replace this with your actual procedures
	 */
	getExample: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const result = await ${kebabToCamel(name)}Service.getExample(input.id);
			return result;
		}),
});
`;

const getApiServiceTemplate = (name) => `import tryCatch from '@/lib/core/utils/try-catch';
import { TRPCThrow } from '@/trpc/server/api/site/errors';
import { site } from '@/trpc/server/site';

/**
 * ${kebabToTitle(name)} Service
 *
 * Contains business logic for the ${name} feature.
 * Separates database operations and business rules from tRPC procedures.
 */

/**
 * Example service function
 * Replace this with your actual business logic
 */
export const getExample = async (id: string) => {
	const { data, error } = await tryCatch(
		// Replace with your actual database query
		Promise.resolve({ id, example: 'This is example data' })
	);

	if (error) {
		console.error(
			'getExample: An unexpected error occurred',
			error,
			{ id }
		);
		TRPCThrow.internalError(
			'An unexpected error occurred. Please try again.'
		);
	}

	if (!data) {
		TRPCThrow.notFound('Example not found.');
	}

	return {
		success: true,
		data,
	};
};
`;

const getComponentTemplate = (name) => `/**
 * ${kebabToTitle(name)} Component
 *
 * Main component for the ${name} feature.
 */
const ${kebabToPascal(name)}Component = () => {
	return (
		<div>
			<h2>${kebabToTitle(name)} Component</h2>
			<p>Replace this with your component implementation.</p>
		</div>
	);
};

export default ${kebabToPascal(name)}Component;
`;

const getHeaderActionComponentTemplate = (name) => `'use client';

/**
 * ${kebabToTitle(name)} Header Action
 *
 * Displayed in the header when viewing ${name} pages.
 * Customize this to add feature-specific header controls.
 */
const ${kebabToPascal(name)}HeaderAction = () => {
	return (
		<div>
			{/* Implement your header action UI for the ${kebabToTitle(name)} feature here */}
			<p>${kebabToTitle(name)} Header Action</p>
		</div>
	);
};

export default ${kebabToPascal(name)}HeaderAction;
`;

const getModalComponentTemplate = (name) => `'use client';

import ModalLayout from '@/modals/modal-layout';

/**
 * Example ${kebabToTitle(name)} Modal
 *
 * This is a sample modal for the ${name} feature.
 * Customize or create additional modals as needed.
 */
const Example${kebabToPascal(name)}Modal = () => {
	return (
		<ModalLayout
			title='Example ${kebabToTitle(name)} Modal'
			description='This is a sample modal for the ${name} feature.'
			displayImage={{ type: 'icon', iconText: '✨' }}
		>
			<div className='p-4'>
				<p>Modal content goes here.</p>
				<p>Implement your modal UI and logic.</p>
			</div>
		</ModalLayout>
	);
};

export default Example${kebabToPascal(name)}Modal;
`;

const getLibTypesTemplate = (name) => `/**
 * ${kebabToTitle(name)} Feature Types
 *
 * Add your feature-specific TypeScript types and interfaces here.
 */

export interface Example${kebabToPascal(name)}Type {
	id: string;
	name: string;
	// Add your properties
}
`;

const getLibValidationTemplate = (name) => `import * as z from 'zod';

/**
 * ${kebabToTitle(name)} Validation Schemas
 *
 * Zod schemas for runtime validation of ${name} feature data.
 * These are used in tRPC procedures and forms.
 */

/**
 * Example validation schema
 * Replace this with your actual validation requirements
 */
export const Example${kebabToPascal(name)}Schema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be less than 100 characters')
		.trim(),
	description: z.string().optional(),
});

// Type exports
export type Example${kebabToPascal(name)}Input = z.infer<typeof Example${kebabToPascal(name)}Schema>;
`;

const getPagesIndexTemplate = (name) => `/**
 * ${kebabToTitle(name)} Page
 *
 * Main page component for the ${name} feature.
 * Use this for reusable page sections that can be composed into routes.
 */
const ${kebabToPascal(name)}Page = () => {
	return (
		<div>
			<h1>${kebabToTitle(name)}</h1>
			<p>Implement your page content here.</p>
		</div>
	);
};

export default ${kebabToPascal(name)}Page;
`;

const getHeaderActionsTemplate = (name) => `import { lazy } from 'react';
import { createHeaderActionDefinition } from '@/lib/ui/header-actions';

/**
 * ${kebabToTitle(name)} Feature - Header Action Definitions
 *
 * This file defines all header actions related to the ${name} feature.
 * Each header action is created using createHeaderActionDefinition() which provides
 * full type inference for props and automatic route matching.
 */

/**
 * ${kebabToTitle(name)} page header action
 * Displays custom content in the header when viewing ${name} pages
 */
export const ${kebabToCamel(name)}Page = createHeaderActionDefinition({
	Component: lazy(() => import('./components/${name}-header-action')),
	config: {
		// Match any pathname that starts with /${name}
		// Adjust this pattern to match your route structure
		routeMatcher: '/${name}',
	},
});
`;

const getModalsTemplate = (name) => `import { lazy } from 'react';
import { createModalDefinition } from '@/lib/ui/modals';

/**
 * ${kebabToTitle(name)} Feature - Modal Definitions
 *
 * This file defines all modals related to the ${name} feature.
 * Each modal is created using createModalDefinition() which provides
 * full type inference for props.
 */

/**
 * Example ${kebabToTitle(name)} Modal
 *
 * Props: None required (add interface above if you need props)
 * @example
 * const { openModal } = useModals();
 * openModal('example${kebabToPascal(name)}Modal');
 */
export const example${kebabToPascal(name)}Modal = createModalDefinition({
	Component: lazy(() => import('./components/modals/example-${name}-modal')),
	defaultConfig: {
		size: 'md',
		title: '${kebabToTitle(name)} Modal',
		description: 'An example modal for the ${name} feature.',
	},
});
`;

// --- FILE CREATION LOGIC ---

async function createFeature(name, modules, { dryRun = false } = {}) {
	const basePath = path.join(PROJECT_ROOT, 'src', 'features', name);
	log.step(`Scaffolding feature '${name}'`);
	log.dim(`Location: ${basePath}`);
	if (dryRun) log.dryRun('Dry run mode is enabled. No files will be modified.');

	// Check if feature already exists
	try {
		await access(basePath);
		log.error(`Feature '${name}' already exists. Aborting.`);
		process.exit(1);
	} catch (e) {
		// Directory does not exist, which is good - proceed
	}

	// Create base directory
	if (dryRun) {
		log.dryRun(`Would create directory: ${basePath}`);
	} else {
		await mkdir(basePath, { recursive: true });
	}
	log.success('Created feature directory');

	// Initialize ts-morph project for registry updates
	const project = new Project({
		tsConfigFilePath: path.join(PROJECT_ROOT, 'tsconfig.json'),
	});

	const createdFiles = [];
	const updatedFiles = [];

	try {
		// Create selected modules
		for (const module of modules) {
			const options = { dryRun, createdFiles };
			switch (module) {
				case 'api':
					await createApiModule(name, basePath, project, options);
					updatedFiles.push('src/trpc/server/api/site/root.ts');
					break;
				case 'components':
					await createComponentsModule(name, basePath, options);
					break;
				case 'lib':
					await createLibModule(name, basePath, options);
					break;
				case 'pages':
					await createPagesModule(name, basePath, options);
					break;
				case 'header-actions':
					await createHeaderActionsModule(name, basePath, project, modules, options);
					updatedFiles.push('src/components/layouts/main/header/header-actions/registry.ts');
					break;
				case 'modals':
					await createModalsModule(name, basePath, project, modules, options);
					updatedFiles.push('src/modals/registry.ts');
					break;
			}
		}

		// Save all ts-morph changes
		if (dryRun) {
			log.dryRun('Would save changes to all modified source files.');
		} else {
			await project.save();
		}

		if (updatedFiles.length > 0) {
			log.success('Updated registry files');
		}

		// Print summary
		log.step('🚀 Feature creation complete!');
		console.log();
		console.log(chalk.bold('Created files:'));
		createdFiles.forEach((file) => log.dim(file));

		if (updatedFiles.length > 0) {
			console.log();
			console.log(chalk.bold('Updated files:'));
			updatedFiles.forEach((file) => log.dim(file));
		}

		console.log();
		log.info('Next steps:');
		log.dim('1. Add a route in \'src/routes/\' if this feature needs a URL');
		log.dim('2. Start implementing your feature logic!');
	} catch (error) {
		log.error(`An error occurred during feature creation: ${error.message}`);
		log.warn('The project may be in an inconsistent state.');

		if (!dryRun) {
			const { confirmCleanup } = await prompts({
				type: 'confirm',
				name: 'confirmCleanup',
				message: `Attempt to roll back changes and remove the partially created feature '${name}'?`,
				initial: true,
			});

			if (confirmCleanup) {
				await removeFeature(name, { force: true, dryRun: false });
			}
		}
		process.exit(1);
	}
}

async function createApiModule(name, basePath, project, { dryRun, createdFiles }) {
	log.info('Creating API module...');
	const apiPath = path.join(basePath, 'api');
	const servicesPath = path.join(apiPath, 'services');

	if (dryRun) {
		log.dryRun(`Would create directory: ${servicesPath}`);
	} else {
		await mkdir(servicesPath, { recursive: true });
	}

	const filesToWrite = {
		[path.join(apiPath, 'index.ts')]: getApiIndexTemplate(name),
		[path.join(apiPath, `${name}.ts`)]: getApiModuleTemplate(name),
		[path.join(servicesPath, `${name}.service.ts`)]: getApiServiceTemplate(name),
	};

	for (const [filePath, content] of Object.entries(filesToWrite)) {
		if (dryRun) {
			log.dryRun(`Would write file: ${filePath}`);
		} else {
			await writeFile(filePath, content);
		}
	}

	createdFiles.push(
		`src/features/${name}/api/index.ts`,
		`src/features/${name}/api/${name}.ts`,
		`src/features/${name}/api/services/${name}.service.ts`
	);

	log.success('Created API module');
	await updateTrpcRoot(name, project, { dryRun });
}

async function createComponentsModule(name, basePath, { dryRun, createdFiles, minimal = false }) {
	log.info('Creating components module...');
	const componentsPath = path.join(basePath, 'components');

	if (dryRun) {
		log.dryRun(`Would create directory: ${componentsPath}`);
	} else {
		await mkdir(componentsPath, { recursive: true });
	}
	const componentsDirRelative = `src/features/${name}/components/`;
	createdFiles.push(componentsDirRelative);

	if (!minimal) {
		const componentFile = path.join(componentsPath, `${name}-component.tsx`);
		if (dryRun) {
			log.dryRun(`Would write file: ${componentFile}`);
		} else {
			await writeFile(componentFile, getComponentTemplate(name));
		}
		createdFiles.push(`${componentsDirRelative}${name}-component.tsx`);
		log.success('Created components module');
	} else {
		log.dim('Created components directory (minimal)');
	}
	return componentsDirRelative;
}

async function createLibModule(name, basePath, { dryRun, createdFiles }) {
	log.info('Creating lib module...');
	const libPath = path.join(basePath, 'lib');
	const typesPath = path.join(libPath, 'types');
	const validationPath = path.join(libPath, 'validation');

	if (dryRun) {
		log.dryRun(`Would create directory: ${typesPath}`);
		log.dryRun(`Would create directory: ${validationPath}`);
	} else {
		await mkdir(typesPath, { recursive: true });
		await mkdir(validationPath, { recursive: true });
	}

	const filesToWrite = {
		[path.join(typesPath, 'index.ts')]: getLibTypesTemplate(name),
		[path.join(validationPath, `${name}.z.ts`)]: getLibValidationTemplate(name),
	};

	for (const [filePath, content] of Object.entries(filesToWrite)) {
		if (dryRun) {
			log.dryRun(`Would write file: ${filePath}`);
		} else {
			await writeFile(filePath, content);
		}
	}

	createdFiles.push(
		`src/features/${name}/lib/types/index.ts`,
		`src/features/${name}/lib/validation/${name}.z.ts`
	);
	log.success('Created lib module');
}

async function createPagesModule(name, basePath, { dryRun, createdFiles }) {
	log.info('Creating pages module...');
	const pagesPath = path.join(basePath, 'pages');

	if (dryRun) {
		log.dryRun(`Would create directory: ${pagesPath}`);
	} else {
		await mkdir(pagesPath, { recursive: true });
	}

	const pageFile = path.join(pagesPath, 'index.tsx');
	if (dryRun) {
		log.dryRun(`Would write file: ${pageFile}`);
	} else {
		await writeFile(pageFile, getPagesIndexTemplate(name));
	}
	createdFiles.push(`src/features/${name}/pages/index.tsx`);
	log.success('Created pages module');
}

async function createHeaderActionsModule(name, basePath, project, modules, { dryRun, createdFiles }) {
	log.info('Creating header-actions module...');

	// Ensure components directory exists
	if (!modules.includes('components')) {
		log.warn('Creating components directory for header action component');
		await createComponentsModule(name, basePath, { dryRun, createdFiles, minimal: true });
	}

	const filesToWrite = {
		[path.join(basePath, 'header-actions.ts')]: getHeaderActionsTemplate(name),
		[path.join(basePath, 'components', `${name}-header-action.tsx`)]: getHeaderActionComponentTemplate(name),
	};

	for (const [filePath, content] of Object.entries(filesToWrite)) {
		if (dryRun) {
			log.dryRun(`Would write file: ${filePath}`);
		} else {
			await writeFile(filePath, content);
		}
	}

	createdFiles.push(
		`src/features/${name}/header-actions.ts`,
		`src/features/${name}/components/${name}-header-action.tsx`
	);
	log.success('Created header-actions module');

	await updateSpreadRegistry({
		project,
		dryRun,
		filePath: path.join(PROJECT_ROOT, 'src/components/layouts/main/header/header-actions/registry.ts'),
		variableName: 'headerActionRegistry',
		importAlias: `${kebabToCamel(name)}HeaderActions`,
		moduleSpecifier: `@/features/${name}/header-actions`,
	});
}

async function createModalsModule(name, basePath, project, modules, { dryRun, createdFiles }) {
	log.info('Creating modals module...');
	const modalsComponentDir = path.join(basePath, 'components', 'modals');

	// Ensure components directory exists
	if (!modules.includes('components')) {
		log.warn('Creating components directory for modal component');
		await createComponentsModule(name, basePath, { dryRun, createdFiles, minimal: true });
	}

	if (dryRun) {
		log.dryRun(`Would create directory: ${modalsComponentDir}`);
	} else {
		await mkdir(modalsComponentDir, { recursive: true });
	}

	const filesToWrite = {
		[path.join(basePath, 'modals.ts')]: getModalsTemplate(name),
		[path.join(modalsComponentDir, `example-${name}-modal.tsx`)]: getModalComponentTemplate(name),
	};

	for (const [filePath, content] of Object.entries(filesToWrite)) {
		if (dryRun) {
			log.dryRun(`Would write file: ${filePath}`);
		} else {
			await writeFile(filePath, content);
		}
	}

	createdFiles.push(
		`src/features/${name}/modals.ts`,
		`src/features/${name}/components/modals/example-${name}-modal.tsx`
	);
	log.success('Created modals module');

	await updateSpreadRegistry({
		project,
		dryRun,
		filePath: path.join(PROJECT_ROOT, 'src/modals/registry.ts'),
		variableName: 'modalRegistry',
		importAlias: `${kebabToCamel(name)}Modals`,
		moduleSpecifier: `@/features/${name}/modals`,
	});
}

// --- AST MANIPULATION ---

async function updateTrpcRoot(name, project, { dryRun }) {
	log.info('Updating tRPC router registry...');
	const filePath = path.join(PROJECT_ROOT, 'src/trpc/server/api/site/root.ts');
	const sourceFile = project.addSourceFileAtPath(filePath);
	const camelName = kebabToCamel(name);
	const routerName = `${camelName}FeatureRouter`;

	if (dryRun) {
		log.dryRun(`Would add import { ${routerName} } from '@/features/${name}/api' to ${filePath}`);
	} else {
		sourceFile.addImportDeclaration({
			moduleSpecifier: `@/features/${name}/api`,
			namedImports: [{ name: routerName }],
		});
	}

	const appRouter = sourceFile.getVariableDeclaration('appRouter');
	if (!appRouter) {
		throw new Error(`Could not find 'appRouter' variable in '${filePath}'.`);
	}
	const callExpr = appRouter.getInitializerIfKind(SyntaxKind.CallExpression);
	if (!callExpr) {
		throw new Error(`'appRouter' variable in '${filePath}' is not initialized with a function call.`);
	}
	const objLiteral = callExpr.getArguments()[0]?.asKind(SyntaxKind.ObjectLiteralExpression);
	if (!objLiteral) {
		throw new Error(`Could not find object literal argument in createTRPCRouter call in '${filePath}'.`);
	}

	if (dryRun) {
		log.dryRun(`Would add property '${camelName}: ${routerName}' to appRouter object.`);
	} else {
		objLiteral.addPropertyAssignment({ name: camelName, initializer: routerName });
		sourceFile.formatText();
	}

	log.dim(`Added ${routerName} to appRouter`);
}

async function updateSpreadRegistry({ project, dryRun, filePath, variableName, importAlias, moduleSpecifier }) {
	log.info(`Updating registry at ${path.basename(filePath)}...`);
	const sourceFile = project.addSourceFileAtPath(filePath);

	if (dryRun) {
		log.dryRun(`Would add import * as ${importAlias} from '${moduleSpecifier}' to ${filePath}`);
	} else {
		sourceFile.addImportDeclaration({ moduleSpecifier, namespaceImport: importAlias });
	}

	const registry = sourceFile.getVariableDeclaration(variableName);
	if (!registry) throw new Error(`Could not find '${variableName}' in ${filePath}`);

	let objLiteral;
	const initializer = registry.getInitializer();
	if (initializer?.isKind(SyntaxKind.AsExpression)) {
		objLiteral = initializer.getExpressionIfKind(SyntaxKind.ObjectLiteralExpression);
	} else {
		objLiteral = initializer?.asKind(SyntaxKind.ObjectLiteralExpression);
	}
	if (!objLiteral) throw new Error(`Expected '${variableName}' to have an object literal initializer.`);

	if (dryRun) {
		log.dryRun(`Would add spread property '...${importAlias}' to ${variableName} object.`);
	} else {
		const existingSpreads = objLiteral.getProperties().filter(p => p.isKind(SyntaxKind.SpreadAssignment));
		objLiteral.insertSpreadAssignment(existingSpreads.length, { expression: importAlias });
		sourceFile.formatText();
	}

	log.dim(`Added ${importAlias} to ${variableName}`);
}

// --- REMOVAL LOGIC ---

async function removeFeature(name, { force = false, dryRun = false } = {}) {
	const basePath = path.join(PROJECT_ROOT, 'src', 'features', name);
	log.step(`Removing feature '${name}'`);
	if (dryRun) log.dryRun('Dry run mode is enabled. No files will be modified.');

	let featureExists = false;
	try {
		await access(basePath);
		featureExists = true;
	} catch (e) {
		// Directory does not exist
	}

	if (!force) {
		const { confirm } = await prompts({
			type: 'confirm',
			name: 'confirm',
			message: featureExists
				? `Remove feature '${name}' from registries and delete its directory?`
				: `Feature directory doesn't exist. Remove '${name}' from registries anyway?`,
			initial: false,
		});

		if (!confirm) {
			log.warn('Removal cancelled.');
			process.exit(0);
		}
	}

	const project = new Project({
		tsConfigFilePath: path.join(PROJECT_ROOT, 'tsconfig.json'),
	});
	const updatedFiles = [];

	try {
		await removeTrpcRouter(name, project, { dryRun });
		updatedFiles.push('src/trpc/server/api/site/root.ts');
	} catch (err) {
		log.warn(`Could not update tRPC router: ${err.message}`);
	}

	try {
		await removeSpreadRegistry({
			project, dryRun,
			filePath: path.join(PROJECT_ROOT, 'src/modals/registry.ts'),
			variableName: 'modalRegistry', importAlias: `${kebabToCamel(name)}Modals`,
			moduleSpecifier: `@/features/${name}/modals`,
		});
		updatedFiles.push('src/modals/registry.ts');
	} catch (err) {
		log.warn(`Could not update modals registry: ${err.message}`);
	}

	try {
		await removeSpreadRegistry({
			project, dryRun,
			filePath: path.join(PROJECT_ROOT, 'src/components/layouts/main/header/header-actions/registry.ts'),
			variableName: 'headerActionRegistry', importAlias: `${kebabToCamel(name)}HeaderActions`,
			moduleSpecifier: `@/features/${name}/header-actions`,
		});
		updatedFiles.push('src/components/layouts/main/header/header-actions/registry.ts');
	} catch (err) {
		log.warn(`Could not update header actions registry: ${err.message}`);
	}

	if (dryRun) {
		log.dryRun('Would save changes to all modified source files.');
	} else {
		await project.save();
	}

	if (featureExists) {
		if (dryRun) {
			log.dryRun(`Would delete feature directory: ${basePath}`);
		} else {
			await rm(basePath, { recursive: true, force: true });
			log.success(`Deleted feature directory: ${basePath}`);
		}
	}

	log.step('🗑️  Feature removal complete!');
	if (updatedFiles.length > 0) {
		console.log();
		console.log(chalk.bold('Updated files:'));
		updatedFiles.forEach((file) => log.dim(file));
		console.log();
	}
}

async function removeTrpcRouter(name, project, { dryRun }) {
	const filePath = path.join(PROJECT_ROOT, 'src/trpc/server/api/site/root.ts');
	const sourceFile = project.getSourceFile(filePath) ?? project.addSourceFileAtPath(filePath);
	const camelName = kebabToCamel(name);

	const importDecl = sourceFile.getImportDeclaration(d => d.getModuleSpecifierValue() === `@/features/${name}/api`);
	if (importDecl) {
		if (dryRun) log.dryRun(`Would remove import from ${filePath}`);
		else importDecl.remove();
	}

	const appRouter = sourceFile.getVariableDeclaration('appRouter');
	if (appRouter) {
		const objLiteral = appRouter.getInitializerIfKind(SyntaxKind.CallExpression)?.getArguments()[0]?.asKind(SyntaxKind.ObjectLiteralExpression);
		if (objLiteral) {
			const prop = objLiteral.getProperty(camelName);
			if (prop) {
				if (dryRun) log.dryRun(`Would remove '${camelName}' property from appRouter in ${filePath}`);
				else prop.remove();
			}
		}
	}

	if (!dryRun) sourceFile.formatText();
	log.success('Removed from tRPC router');
}

async function removeSpreadRegistry({ project, dryRun, filePath, variableName, importAlias, moduleSpecifier }) {
	const sourceFile = project.getSourceFile(filePath) ?? project.addSourceFileAtPath(filePath);

	const importDecl = sourceFile.getImportDeclaration(d => d.getModuleSpecifierValue() === moduleSpecifier);
	if (importDecl) {
		if (dryRun) log.dryRun(`Would remove import from ${filePath}`);
		else importDecl.remove();
	}

	const registry = sourceFile.getVariableDeclaration(variableName);
	if (registry) {
		let objLiteral;
		const initializer = registry.getInitializer();
		if (initializer?.isKind(SyntaxKind.AsExpression)) {
			objLiteral = initializer.getExpressionIfKind(SyntaxKind.ObjectLiteralExpression);
		} else {
			objLiteral = initializer?.asKind(SyntaxKind.ObjectLiteralExpression);
		}

		if (objLiteral) {
			const spreadProp = objLiteral.getProperties().find(
				p => p.isKind(SyntaxKind.SpreadAssignment) && p.getExpression().getText() === importAlias
			);
			if (spreadProp) {
				if (dryRun) log.dryRun(`Would remove '...${importAlias}' from ${variableName} in ${filePath}`);
				else spreadProp.remove();
			}
		}
	}

	if (!dryRun) sourceFile.formatText();
	log.success(`Removed from ${variableName}`);
}

/**
 * CLI entry point that parses command-line arguments and either scaffolds a new feature or removes an existing one.
 *
 * Parses flags and positional arguments, supports interactive prompts when values are missing, validates the
 * feature name (kebab-case), and dispatches to creation or removal routines. Handles --help output, module
 * selection for scaffolding, and exits with appropriate status on validation errors or user cancellation.
 */

async function main() {
	console.log(chalk.bold.cyan('\n🎨 Feature Scaffolding Tool\n'));

	const args = minimist(process.argv.slice(2), {
		string: ['name', 'feature-name'],
		boolean: ['help', 'remove', 'dry-run'],
		alias: { n: 'name', f: 'feature-name', r: 'remove', h: 'help' }
	});

	if (args.help) {
		console.log(chalk.bold('Usage:'));
		console.log('  npm run create                               # Interactive mode');
		console.log('  npm run create -- my-feature                 # Create with positional arg');
		console.log('  npm run create -- --name=my-feature          # Create with --name flag');
		console.log('  npm run create -- --remove my-feature        # Remove a feature');
		console.log('  npm run create -- --dry-run [my-feature]     # Preview actions without changes');
		console.log();
		console.log(chalk.bold('Options:'));
		console.log('  -n, --name         Feature name (kebab-case)');
		console.log('  -r, --remove       Remove a feature and its registry entries');
		console.log('      --dry-run      Show what would be done without making changes');
		console.log('  -h, --help         Show this help message');
		console.log();
		process.exit(0);
	}

	const options = { dryRun: args['dry-run'] ?? false };
	const isRemoveMode = args.remove;
	let featureName = args.name || args['feature-name'] || args._[0];

	if (isRemoveMode) {
		if (!featureName) {
			log.error('Feature name is required for removal. Usage: npm run create -- --remove <feature-name>');
			process.exit(1);
		}
		if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(featureName)) {
			log.error('Feature name must be in kebab-case (e.g., my-feature, user-profile)');
			process.exit(1);
		}
		await removeFeature(featureName, options);
		return;
	}

	if (!featureName) {
		const response = await prompts({
			type: 'text',
			name: 'name',
			message: 'Enter the name for the new feature (kebab-case):',
			validate: (value) =>
				/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
					? true
					: 'Name must be in kebab-case (e.g., my-feature, user-profile)',
		});
		if (!response.name) {
			log.error('Feature name is required. Aborting.');
			process.exit(1);
		}
		featureName = response.name;
	}

	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(featureName)) {
		log.error('Feature name must be in kebab-case (e.g., my-feature, user-profile)');
		process.exit(1);
	}

	const { modules } = await prompts({
		type: 'multiselect',
		name: 'modules',
		message: 'Select the modules to create for this feature:',
		choices: [
			{ title: 'API (tRPC routes and services)', value: 'api', selected: true },
			{ title: 'Components (React components)', value: 'components', selected: true },
			{ title: 'Lib (types and validation)', value: 'lib', selected: true },
			{ title: 'Pages (reusable page sections)', value: 'pages', selected: true },
			{ title: 'Header Actions (dynamic header content)', value: 'header-actions' },
			{ title: 'Modals (dialogs/drawers)', value: 'modals' },
		],
		hint: '- Space to select. Return to submit',
		min: 1,
	});

	if (!modules || modules.length === 0) {
		log.warn('No modules selected. Aborting.');
		process.exit(0);
	}

	await createFeature(featureName, modules, options);
}

main().catch((err) => {
	log.error('An unexpected error occurred:');
	console.error(err);
	process.exit(1);
});